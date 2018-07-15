---
layout: post
title: Building Blockchain Using Nodejs
date: 2018-07-14 13:32:20 +0300
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: post-6.jpg # Add image post (optional)
tags: [Blockchain, Nodejs]
author: # Add name author (optional)
---

Blockchain is an `immutable distributed ledger `.A ledger consists of two distinct, though related, parts – a `blockchain` and the `state database`, also known as `world state`. Unlike other ledgers, blockchains are immutable – that is, once a block has been added to the chain, it cannot be changed. In contrast, the `world state` is a database containing the current value of the set of key-value pairs that have been added, modified or deleted by the set of validated and committed transactions in the blockchain.[1](http://hyperledger-fabric.readthedocs.io/en/latest/glossary.html#ledger)

---
## Build a Blockchain

### Prerequisites
You will need the following things properly installed on your laptop/pc.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)

To verfiy everything is installed correctly run followings commands: `npm --version` and `node --version` 

### Project folder structure
With your favourite text editor create `blockchain-node` project folder,go inside that folder and create `src` and `test` folder with `blockchain.js` file inside:

```
blockchain-node
│   README.md
└───src
│   │   blockchain.js  
└───test
    │   blockchain.js  
```

To initialize Nodejs  runtime, from your terminal run command
```
npm init
```
Install SHA256 module to compute SHA256 of strings or bytes.
```
npm i sha256 -S -D
```

Now our blockchain-node folder structure looks like this:
```
blockchain-node
│   README.md
|   package.json
|   
|___node_modules
|
└───src
│   │   blockchain.js  
└───test
    │   blockchain.js  
```


All data are stored inside block objects. A block contains an ordered set of transactions. It is cryptographically linked to the preceding block, and in turn it is linked to be subsequent blocks.the first block in such a chain of blocks is called the `genesis block`. Later, it will be connnected in a chain inside our blockchain

{% highlight javascript %}
class Block {
    constructor(index, timestamp, nonce, prevBlockHash, hash, transactions) {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.nonce = nonce;
        this.hash = hash;
        this.prevBlockHash = prevBlockHash;
    }
}
{% endhighlight %}

Block object has following property:
* `index:` this is basically the block number in our chain.
* `timestamp:` the time when this block was created.
* `transactions:` when we create a new block, we want to store all of the new transactions that have just been created. These blocks are immutable.
* `nonce:` nonce ("number only used once") is a number added to a hashed block that, when rehashed, meets the difficulty level restrictions. The nonce is the number that blockchain miners are solving for.
* `hash:` a single string that all of our transactions and some info are going to be basically compressed into.
* `prevBlockHash:`  hash data from previous block.

### Blockchain Object
`Blockchain` class has ability to be instantiated, create new Block, access the latest Block information, make new Transaction, hash Block, run Proof Of Work, and has chain of Blocks along with pending Transactions that should be stored when new Block is created.

### Constructor
{% highlight javascript %}
class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        this.creatNewBlock(100, '0', 'Genesis block');
    }
}
{% endhighlight %}

* `chain:` is a transaction log structured as hash-linked blocks of transactions
* `transactions:` where we will hold all of the new transactions that are created before they are placed into a new Block.
* We also create a Genesis Block in the constructor function.


 
So what is a Genesis Block?
> The configuration block that initializes the ordering service, or serves as the first block on a chain.

The `createNewBlock()` method has a `nonce`, a `prevBlockHash` and a `hash` as parameters.
We don’t have any prevBlockHash and we haven’t done any Proof Of Work. So to create this Block, we simply pass in some arbitrary parameters like below (or anything we like):
+ nonce: 100
+ prevBlockHash: ‘0’
+ hash: ‘Genesis block’

Create new Block
{% highlight javascript %}
class Blockchain {
    ...
    creatNewBlock(nonce, prevBlockHash, hash) {
        const newBlock = new Block(
            this.chain.length + 1,
            Date.now(),
            nonce,
            prevBlockHash,
            hash,
            this.pendingTransactions
        );

        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }
}

{% endhighlight %}
This method takes 3 parameters: nonce, prevBlockHash and hash.
* First, we create a new Block object.
* Next, we set pendingTransactions equal to an empty array. This is because once we create a new Block, we are putting all of the new transactions into this Block. Clearing the entire transactions array helps us start over for the next Block.
* Then we push new Block into our chain.
* Finally we return the new Block.

### Get latest Block
{% highlight javascript %}
class Blockchain {
    ...
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
}
{% endhighlight %}
### Make new Transaction
{% highlight javascript %}
class Blockchain {
    ...
    makeNewTransaction(amount, sender, recipient) {
        const transaction = {
            amount: amount,
            sender: sender,
            recipient: recipient
        }

        this.pendingTransactions.push(transaction);

        console.log(`>>> Transaction: ${amount} from ${sender} to ${recipient}`);

        return this.getLatestBlock().index + 1;
    }
{% endhighlight %}

This method takes 3 parameters:
* `amount:` indicates how much is being sent in this transaction.
* `sender:` sender’s address.
* `recipient:` recipient’s address.

* First, we create a new transaction object from these parameters.
* Next, we push this transaction into our pendingtransactions array.


Remember all this transactions in this array are not really set in the ledger. They’re not really recorded into our Blockchain yet, it just happens when a new Block is created.
> So all of these new transactions are just pending transactions and they have not been validated.


 
* Finally, we return the number of the Block that this transaction will be added to.

### Hash Block
Inside of this method, we use SHA256 hashing to hash our Block data.


{% highlight javascript %}
const sha256 = require('sha256');

class Blockchain {
    ...
    hashBlock(prevBlockHash, currentBlock, nonce) {
        const data = prevBlockHash + JSON.stringify(currentBlock) + nonce;
        const hash = sha256(data);
        return hash;
    }
}
{% endhighlight %}

### Proof of Work
Proof of Work is a very important method essential to Blockchain technology. It is one of the reasons that Bitcoin and many other Blockchains are so secured.

So, what is Proof of Work?
> Proof-of-Work, or PoW, is the original consensus algorithm in a Blockchain network[2].

Everytime we create a new Block, we first have to make sure that it is a legitimate block by mining it through Proof of Work.

`proofOfWork()` method will take in the prevBlockHash and the currentBlockData.
From this data, it is going to try to generate a specific hash.


{% highlight javascript %}
class Blockchain {
    ...
    proofOfWork(prevBlockHash, currentBlockData) {
        let nonce = 0;
        let hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);

        while (hash.substring(0, 2) !== '00') {
            nonce++;
            hash = this.hashBlock(prevBlockHash, currentBlockData, nonce);
        };

        return nonce;
    }
}
{% endhighlight %}

This hash, in our case, is going to be a hash that starts with 2 zeros ('00').
The hash that is generated from SHA256 is random. So inorder to make it possible we can run our `hashBlock()` method many many times until we get a hash that starts with 2 zeros.

The `proofOfWork()` method will secure our Blockchain is because in order to generate the correct hash, we have to run `hashBlock()` numerous time thus resulting a high computing power and energy.


 
Here yo can see our  `hashBlock()` method takes not only the  currentBlockData, but  also the prevBlockHash. This means that all of the Blocks in our Blockchain are linked together by their data.


### Run Blockchain
`test.blockchain.js`


{% highlight javascript %}
const Blockchain = require('../src/blockchain');

function mine(blockChain) {
    console.log('>>> Mining............');

    const latestBlock = blockChain.getLatestBlock(),
          prevBlockHash = latestBlock.hash,
          currentBlockData = {
            transactions: blockChain.pendingTransactions,
            index: latestBlock.index + 1
         },
         nonce = blockChain.proofOfWork(prevBlockHash, currentBlockData),
         blockHash = blockChain.hashBlock(prevBlockHash, currentBlockData, nonce);

    // reward for mining
    blockChain.makeNewTransaction(1, '00000', 'miningNode');

    console.log('>>> Create new Block:\n', blockChain.creatNewBlock(nonce, prevBlockHash, blockHash));
}

const bitcoin = new Blockchain();
console.log('>>> Create new Blockchain:\n', bitcoin);

bitcoin.makeNewTransaction(120, 'JACK', 'JASON');

mine(bitcoin);

bitcoin.makeNewTransaction(1120, 'JACK', 'JASON');
bitcoin.makeNewTransaction(300, 'JASON', 'JACK');
bitcoin.makeNewTransaction(2700, 'JACK', 'JASON');

mine(bitcoin);

console.log('>>> Current Blockchain Data:\n', bitcoin);


{% endhighlight %}

Run cammand: `node test/blockchain.js`.

### Create new Blockchain:
 {% highlight javascript %}
  >>> Create new Blockchain:
 Blockchain {
  chain:
   [ Block {
       index: 1,
       timestamp: 1531653271727,
       transactions: [],
       nonce: 100,
       hash: 'Genesis block',
       prevBlockHash: '0' } ],
  pendingTransactions: [] }
>>> Transaction: 120 from JACK to JASON
>>> Mining............
>>> Transaction: 1 from 00000 to miningNode
>>> Create new Block:
 Block {
  index: 2,
  timestamp: 1531653271748,
  transactions:
   [ { amount: 120, sender: 'JACK', recipient: 'JASON' },
     { amount: 1, sender: '00000', recipient: 'miningNode' } ],
  nonce: 158,
  hash:
   '00fc872e1ec7592dc50432882f601d0a30805d40925760e2b4363d288bee0d1e',
  prevBlockHash: 'Genesis block' }
>>> Transaction: 1120 from JACK to JASON
>>> Transaction: 300 from JASON to JACK
>>> Transaction: 2700 from JACK to JASON
>>> Mining............
>>> Transaction: 1 from 00000 to miningNode
>>> Create new Block:
 Block {
  index: 3,
  timestamp: 1531653271758,
  transactions:
   [ { amount: 1120, sender: 'JACK', recipient: 'JASON' },
     { amount: 300, sender: 'JASON', recipient: 'JACK' },
     { amount: 2700, sender: 'JACK', recipient: 'JASON' },
     { amount: 1, sender: '00000', recipient: 'miningNode' } ],
  nonce: 114,
  hash:
   '004c9050ff88b37deafc039a0ec3c4212a5cadb4a51e57039b928b64edfcd82b',
  prevBlockHash:
   '00fc872e1ec7592dc50432882f601d0a30805d40925760e2b4363d288bee0d1e' }
>>> Current Blockchain Data:
 Blockchain {
  chain:
   [ Block {
       index: 1,
       timestamp: 1531653271727,
       transactions: [],
       nonce: 100,
       hash: 'Genesis block',
       prevBlockHash: '0' },
     Block {
       index: 2,
       timestamp: 1531653271748,
       transactions: [Array],
       nonce: 158,
       hash:
        '00fc872e1ec7592dc50432882f601d0a30805d40925760e2b4363d288bee0d1e',
       prevBlockHash: 'Genesis block' },
     Block {
       index: 3,
       timestamp: 1531653271758,
       transactions: [Array],
       nonce: 114,
       hash:
        '004c9050ff88b37deafc039a0ec3c4212a5cadb4a51e57039b928b64edfcd82b',
       prevBlockHash:
        '00fc872e1ec7592dc50432882f601d0a30805d40925760e2b4363d288bee0d1e' } ],
  pendingTransactions: [] }

  {% endhighlight %}


### Making Development Faster
Instead of running `node test/blockchain.js` we can use 
`nodemon test/blockchain.js`, here we use [nodemon](https://github.com/remy/nodemon) which helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.


[Source Code for Blockchain in Nodejs](https://github.com/sumn2u/blockchain-node/archive/0.1.zip)



### Additional
Implementation of blockchain using Nodejs to build a coin for demonstration purpose can be seen in [Fusecoin](https://github.com/sumn2u/fusecoin). This is by  no means a complete implementation and it is by no means secure!


In the ``src/`` directory you'll find different versions:

* v1: implementation of blockchain basics 
* v2: Added proof-of-work mechanism
* v3: Added multiple transactions & mining rewards 



References

[1]http://hyperledger-fabric.readthedocs.io/en/latest/glossary.html#ledger
[2]https://cointelegraph.com/explained/proof-of-work-explained
