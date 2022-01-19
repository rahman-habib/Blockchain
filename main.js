const sha256=require("crypto-js/sha256");
class Transection{
    constructor(fromAddress,toAddress,amount)
    {
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
    }
    calculatehash()
    {
        return sha256(this.fromAddress+this.toAddress+this.amount).toString();
    }
    signTransection(signingkey){
        if(signingkey!==this.fromAddress)
        {
            throw new Error("you cannot sign transaction for other wallet");
        }
        this.hash=this.calculatehash();
        
        this.signature=sha256(this.fromAddress+this.hash).toString();
    }
    isvalid()
    {
        if(this.fromAddress==null)
        {
            return true;
        }
        if(!this.signature||this.signature.length==0)
        {
            throw new Error("no signature in this transaction");
        }
        if((this.hash==this.calculatehash)&&(this.signature==sha256(this.fromAddress+this.hash).toString()))
        {
            return true;
        }

    }

}

class Block{
    constructor(timestamp,transection,previoushah="")
    {
        this.timestamp=timestamp;
        this.transection=transection;
        this.previoushah=previoushah;
        this.hash=this.calculatehash();
        this.nonce=0;
    }
    calculatehash()
    {
        return sha256(this.previoushah+this.timestamp+JSON.stringify(this.transection)+this.nonce).toString();
    }
    minblock(difficulty)
    {
        while(this.hash.substring(0,difficulty)!==Array(difficulty+1).join(0))
        {
            this.nonce++; 
            this.hash=this.calculatehash();
        }
        console.log("minied block"+ this.hash);
    }
    hasValidTransction()
    {
        for(const tx of this.transection)
        {
            if(!tx.isvalid())
            {
                return false;
            }
        }
        return true;
    }
}



class Blockchain{
    constructor(){
        this.chain=[this.creategenesisblock()];
        this.difficulty=2;
        this.pendindTransection=[];
        this.miningRewards=100;
        this.accounts=[];
    }
    creategenesisblock(){
        return new Block("19/1/2021","genesis","0");
    }
    getLatestBlock()
    {
        return this.chain[this.chain.length-1];
    }
   /* addBlock(newblock){
        newblock.previoushah=this.getLatestBlock().hash;
       // newblock.hash=newblock.calculatehash();

       newblock.minblock(this.difficulty );
        this.chain.push(newblock);
    }*/
    createAccount(address)
    {
        this.accounts.push(address);
    }

    minPendingTransection(miningRewardAddress)
    {
        for(let acc of this.accounts)
        
        {
            if(acc.email==miningRewardAddress)
           { 
               let block=new Block(Date.now(),this.pendindTransection);
        block.previoushah=this.getLatestBlock().hash;
        block.minblock(this.difficulty);

        console.log("block successfully mined!");
        this.chain.push(block);

        this.pendindTransection=[new Transection(null,miningRewardAddress,this.miningRewards)];
    }
    }
    }
    addTransaction(transection)
    {
        if(!transection.fromAddress||!transection.toAddress)
        {
            throw new Error("transaction must include from and to address");
        }
        transection.signTransection(transection.fromAddress);
       if(!transection.isvalid)
        {
            throw new Error("cannot add invalid transaction to chain");
        }
        this.pendindTransection.push(transection);
    }
    getBalenceofAddress(address)
    {
        let balance=0;

        for (const block of this.chain) {
            for (const trans of block.transection) {
                if(trans.fromAddress==address)
                {
                    balance-=trans.amount;
                }
                if(trans.toAddress==address)
                {
                    balance+=trans.amount;
                }
                
            }
            
        }
        return balance;
    }
    isChainvalid()
    {
        for (let i = 1; i < this.chain.length; i++) {
            const currentblock=this.chain[i];
            const previousblock=this.chain[i-1];
            if(!currentblock.hasValidTransction())
            {
                return false;
            }
            if(currentblock.hash!==currentblock.calculatehash()){
                return false;
            }
            if(currentblock.previoushah!== previousblock.hash)
            {
                return false;
            }
        }
        return true; 
    }
}
module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;
