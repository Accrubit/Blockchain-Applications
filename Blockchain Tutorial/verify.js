$(document).ready(()=>{
mined = [];
    $('button').not(':first').attr('disabled','disabled');
})
  // Randomized salt for collison avoidance with block hashes
  salt = () => {
    txt = "";
    alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 8; i++)
      txt += alph.charAt(Math.floor(Math.random() * alph.length));
    return txt;
  }
  class Block {
  // Each block contains its hash, hash of previous block, data and uptime.
      constructor(data,prevHash=''){
        this.hash = this.calcHash();
        this.data = data;
        this.prevHash = prevHash;
        this.uptime = 0;
      }
      calcHash(){
        return CryptoJS.SHA512 (
        this.data + this.prevHash + this.uptime + salt()
        ).toString();
      }
      // Proof Of Work (Mining) method dif = difficulty
      mineBlock(dif){
        mined.push("Mining...");
        while(
          this.hash.slice(0, dif)
          !== Array(dif+1).join("0")) {
            this.uptime++;
            this.hash = this.calcHash();
          }
        // Push calculated hash to array
        mined.push("Block mined: " + this.hash)
      }
  }

  class Blockchain {
      constructor(dif){
        this.dif = dif;
        this.chain = [this.genesisBlock()];
      }
      genesisBlock(){
        return new Block("Chain started.")
      }
      lastBlock(){
        return this.chain[this.chain.length - 1]
      }
      //Calculate the new block by using the hash from the last block
      addBlock(block){
        block.prevHash = this.lastBlock().hash;
        block.mineBlock(this.dif);
        this.chain.push(block);
      }
  // Ensure hash of previous block points to current hash of current block
      isValid(){
        if(this.chain.length <= 1)
          return true;
        for(let i=1; i<this.chain.length; i++){
          if(this.chain[i].prevHash !== this.chain[i-1].hash && this.chain.length >= 1)
            return false;
          else return true;
        }
      }
  }
  // The blockchain is now created, the following logic is for mining
  // Show mined blocks
  createChain = () => {
    CHAIN = new Blockchain(parseInt($("input").eq(0).val()));
    $('#log').text(mined.join("\n"));
    $('button').removeAttr("disabled");
  }
  /*
  DOM Manipulations (not related to Blockchain)
  Very messy code here...
  */
  showChain = () => {
    code =  JSON.stringify(CHAIN.chain, null, 4)
    $("pre").eq(0).text(code);
  }
  /* Colorize notification in proper color
  Valid - green, Invalid - red
  */
  checkValid = () => {
    let valid = CHAIN.isValid();
    $("div").eq(0).addClass('notification');
    valid === true ?
    $('div').eq(0).addClass('is-success').html("Blockchain is valid!") : $('div').eq(0).addClass('is-danger').html("Oops! Blockchain is invalid!")
  }
  /*
  Run the code that changes prevHash of the second block
  */
  run = () => {
    eval($('#cor').text());
    $('div').eq(2).addClass('notification is-danger').html("Blockchain corrupted.")
  }
  // Take info from inputs
  addBlock  = () => {
    let data = $('input').eq(1).val();
    CHAIN.addBlock(new Block(data));
    $('div').eq(1).addClass('notification is-success').text('Block #' + CHAIN.chain.indexOf(CHAIN.lastBlock()) + ' was added to the chain.');
    $('#log').text(mined.join("\n"));

  showChain();
  }
