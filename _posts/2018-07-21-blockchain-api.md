---
layout: post
title: Building Blockchain REST API Using Nodejs
date: 2018-07-14 13:32:20 +0300
description:  Blockchain REST API development using Nodejs # Add post description (optional)
img: post-5.jpg # Add image post (optional)
tags: [Blockchain, Nodejs, REST API]
author: # Add name author (optional)
---

Blockchain is an `immutable distributed ledger `.A ledger consists of two distinct, though related, parts – a `blockchain` and the `state database`, also known as `world state`. Unlike other ledgers, blockchains are immutable – that is, once a block has been added to the chain, it cannot be changed. In contrast, the `world state` is a database containing the current value of the set of key-value pairs that have been added, modified or deleted by the set of validated and committed transactions in the blockchain.[1](http://hyperledger-fabric.readthedocs.io/en/latest/glossary.html#ledger)

#### Overview 
Here we are going to create an REST API to interact with the blockchain we made. For that we are using `Express.js` to create our server. We will use three different endpoints to communicate with our block chain.

{% highlight javascript %}
const express = require('express');
/* to get all list of blockchain */
app.get('/blockchain', function (req, res) {
    ...
});
/* to make a new transaction */
app.post('/transaction', function (req, res) {
    ...
});
 /* to mine data using PoW concept */
app.get('/mine', function (req, res) {
    ...
});
{% endhighlight %}
---

### Project folder structure
With your favourite text editor open the created `blockchain-node` project folder, go inside that folder and create `app.js` file:

```
blockchain-node
│   README.md
|   package.json
|   app.js
|   
|___node_modules
|
└───src
│   │   blockchain.js  
└───test
    │   blockchain.js  
```

### Install Express.js
Run command: `npm i express -S -D`.

Inside app.js, import and initialize Express.js:

{% highlight javascript %}
const express = require('express');
const app = express();
{% endhighlight %}

Install body-parser
It is a middleware that can parse incoming request bodies before handlers, available under the `req.body` property.

To install it, run command: `npm i body-parser -S -D`.

Inside `app.js`, add the code below:

{% highlight javascript %}
const bodyParser = require('body-parser');
app.use(bodyParser.json());
{% endhighlight %}

`bodyParser.json()` returns middleware that only parses json.

### Install nodemon
We are using `nodemon` here which automatically restarts the node application when file changes in the directory are detected.

To install it, run command: `npm i nodemon -S -D`.

Then add start script to   `package.json` file:

{% highlight javascript %}
   ......
   "start": "nodemon --watch src -e js src/api.js"
   ......
{% endhighlight %}

Add this code snippnet to your` app.js` file.


{% highlight javascript %}
const express = require('express'),
      app = express(),
      bodyParser = require('body-parser');
app.use(bodyParser.json());

const nodeAddr = 'sampleapp';

const Blockchain = require('./src/blockchain');// require js pattern
const bitcoin = new Blockchain(); 
/* to get all list of blockchain */
app.get('/blockchain', function (req, res) {
    res.send(bitcoin);
});
/* to make a new transaction */
app.post('/transaction', function (req, res) {
    const blockIndex = bitcoin.makeNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient
    );

    res.json(
        {
            message: `Transaction is added to block with index: ${blockIndex}`
        }
    );
});
 /* to mine data using PoW concept */
app.get('/mine', function (req, res) {
    const latestBlock = bitcoin.getLatestBlock();
    const prevBlockHash = latestBlock.hash;
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: latestBlock.index + 1
    }
    const nonce = bitcoin.proofOfWork(prevBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(prevBlockHash, currentBlockData, nonce);

    // reward for mining
    bitcoin.makeNewTransaction(1, '00000', nodeAddr);

    const newBlock = bitcoin.creatNewBlock(nonce, prevBlockHash, blockHash)
    res.json(
        {
            message: 'Mining new Block successfully!',
            newBlock
        }
    );
});

app.listen(3000, function () {
    console.log('> listening on port 3000...');
});
{% endhighlight %}

### Run and Test API
– Run the API with command: `npm start`.

– Open browser with url: `http://localhost:3000/blockchain`.