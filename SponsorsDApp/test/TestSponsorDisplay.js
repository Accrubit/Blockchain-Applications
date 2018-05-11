var SponsorDisplay = artifacts.require("SponsorDisplay");

contract("SponsorDisplay", function(accounts) {
  const initialMessage = "Become a Featured Sponsor!";
  const initialPrice = 10;
  const maxLength = 200;

  beforeEach(async function() {
    this.contract = await SingleMessage.new(initialMessage, initialPrice, maxLength);
  });

  it("should have an initial value and price and owner", async function() {
    assert.equal(await this.contract.message(), initialMessage);
    assert.equal(await this.contract.priceInWei(), initialPrice);
    assert.equal(await this.contract.owner(), accounts[0]);
  });

  it("should allow the message to be set and double the price and emit an event", async function() {
    const price = (await this.contract.priceInWei()).toNumber();
    const newMessage = "new message!";
    const {logs} = await this.contract.set(newMessage, {value: price});
    assert.equal(await this.contract.message(), newMessage);
    assert.equal((await this.contract.priceInWei()).toNumber(), price * 1.05);

    // Make sure the event was emitted properly
    const event = logs.find(e => e.event === "MessageSet");
    assert.equal(event.args.message, newMessage);
    assert.equal(event.args.priceInWei, price);
    assert.equal(event.args.newPriceInWei, price * 1.05);
    assert.equal(event.args.payer, accounts[0]);
  });

  it("should not allow the message to be set if the price is not paid", async function() {
    const price = (await this.contract.priceInWei()).toNumber();
    const newMessage = "new message!";
    try {
      await this.contract.set(newMessage, {value: price-1});
    } catch (error) {
      assert.equal(true, error.message.search('invalid opcode') >= 0);
      assert.equal(await this.contract.message(), initialMessage);
      assert.equal((await this.contract.priceInWei()).toNumber(), price);
      return;
    }
    throw 'Contract should have thrown, but did not!';
  });

  it("should not allow messages over maxLength", async function() {
    const price = (await this.contract.priceInWei()).toNumber();
    const maxLength = (await this.contract.maxLength()).toNumber();
    var newMessage = "";
    for (var i = 0; i < maxLength+1; i++) {
      newMessage = newMessage + "a";
    }
    try {
      await this.contract.set(newMessage, {value: price});
    } catch (error) {
      assert.equal(true, error.message.search('invalid opcode') >= 0);
      assert.equal(await this.contract.message(), initialMessage);
      assert.equal((await this.contract.priceInWei()).toNumber(), price);
      return
    }
  });

  it("should allow the funds to be withdrawn if its the owner", async function() {
    // Setup to install some funds
    const price = (await this.contract.priceInWei()).toNumber();
    const newMessage = "new message!";
    await this.contract.set(newMessage, {value: price});
    assert.equal(await this.contract.message(), newMessage);
    assert.equal((await this.contract.priceInWei()).toNumber(), price * 2);

    // Try and withdraw funds as owner
    const owner = await this.contract.owner();
    const receiver = accounts[1];
    assert.notEqual(owner, receiver);

    const receiverBalance = (await web3.eth.getBalance(receiver)).toNumber();
    await this.contract.withdraw(receiver, price, {from: owner});
    assert.equal((await web3.eth.getBalance(receiver)).toNumber(), receiverBalance + price);
  });

  it("should not allow the funds to be withdrawn if its not the owner", async function() {
    // Setup to install some funds
    const price = (await this.contract.priceInWei()).toNumber();
    const newMessage = "new message!";
    await this.contract.set(newMessage, {value: price});
    assert.equal(await this.contract.message(), newMessage);
    assert.equal((await this.contract.priceInWei()).toNumber(), price * 1.05);

    // Try and withdraw funds as non-owner
    const nonOwner = accounts[1];
    try {
      await this.contract.withdraw(nonOwner, price, {from: nonOwner});
    } catch(error) {
      assert.equal(true, error.message.search('invalid opcode') >= 0);
      return;
    }
    throw 'Contract should have thrown, but did not!';
  });
})
