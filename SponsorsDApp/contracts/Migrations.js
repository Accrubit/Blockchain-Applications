var SponsorDisplay = artifacts.require('../contracts/SponsorDisplay.sol');

module.exports = function(deployer, network, accounts) {
  return liveDeploy(deployer, accounts);
};

async function liveDeploy(deployer, accounts) {
  const initialMessage = "Become a featured sponsor!";
  const initialPriceInWei = 10000000000000000;
  const maxLength = 200;

  console.log("Contract arguments: ", {
    initialMessage: initialMessage,
    initialPriceInWei: initialPriceInWei,
    maxLength: maxLength
  });

  return deployer.deploy(SponsorDisplay, initialMessage, initialPriceInWei, maxLength).then(async() => {
    const contract = await SponsorDisplay.deployed();
    const message = await contract.message.call();
    const priceInWei = await contract.priceInWei.call();
    const maxLength = await contract.maxLength.call();

    console.log("public vars from contract: ", {
      message: message,
      priceInWei: priceInWei,
      maxLength: maxLength
    });
  });
}
