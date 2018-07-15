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

It will give you result of: 

{% highlight json %}
   {
  "chain": [
    {
      "index": 1,
      "timestamp": 1531685189689,
      "transactions": [],
      "nonce": 100,
      "hash": "Genesis block",
      "prevBlockHash": "0"
    }
  ],
  "pendingTransactions": []
}
{% endhighlight %}

Now run `mine` endpoint.i.e
`http://localhost:3000/mine`.

It will mine and give the result of

{% highlight json %}
{
  "message": "Mining new Block successfully!",
  "newBlock": {
    "index": 2,
    "timestamp": 1531685261672,
    "transactions": [
      {
        "amount": 1,
        "sender": "00000",
        "recipient": "sampleapp"
      }
    ],
    "nonce": 44,
    "hash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964",
    "prevBlockHash": "Genesis block"
  }
}
{% endhighlight %}

Now run `http://localhost:3000/blockchain`.It will give you following result
{% highlight json %}
 {
  "chain": [
    {
      "index": 1,
      "timestamp": 1531685189689,
      "transactions": [],
      "nonce": 100,
      "hash": "Genesis block",
      "prevBlockHash": "0"
    },
    {
      "index": 2,
      "timestamp": 1531685261672,
      "transactions": [
        {
          "amount": 1,
          "sender": "00000",
          "recipient": "sampleapp"
        }
      ],
      "nonce": 44,
      "hash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964",
      "prevBlockHash": "Genesis block"
    }
  ],
  "pendingTransactions": []
}
{% endhighlight %}


No make a transaction. make a `POST` request through postman.
![Transaction]({{site.baseurl}}/assets/img/transaction.png)


Now run again the `http://localhost:3000/blockchain`
{% highlight json %}
{
  "chain": [
    {
      "index": 1,
      "timestamp": 1531686556155,
      "transactions": [],
      "nonce": 100,
      "hash": "Genesis block",
      "prevBlockHash": "0"
    },
    {
      "index": 2,
      "timestamp": 1531686569505,
      "transactions": [
        {
          "amount": 1,
          "sender": "00000",
          "recipient": "sampleapp"
        }
      ],
      "nonce": 44,
      "hash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964",
      "prevBlockHash": "Genesis block"
    }
  ],
  "pendingTransactions": [
    {},
    {
      "amount": 190,
      "sender": "JACKIE",
      "recipient": "HELEN"
    }
  ]
}
{% endhighlight %}


You can see the pending transactions. Now the miner will mine it. Now run the `http://localhost:3000/mine` endpoint.
{% highlight json %}
{
  "message": "Mining new Block successfully!",
  "newBlock": {
    "index": 3,
    "timestamp": 1531686968213,
    "transactions": [
      {
        "amount": 190,
        "sender": "JACKIE",
        "recipient": "HELEN"
      },
      {
        "amount": 1,
        "sender": "00000",
        "recipient": "sampleapp"
      }
    ],
    "nonce": 71,
    "hash": "00766767c03993c1c5269bd531599c7e67f414c27f0d8bd56b5de2c7f5964e5f",
    "prevBlockHash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964"
  }
}
{% endhighlight %}

Now let's again run `http://localhost:3000/blockchain` to see our amount is recieved or not and also pending transactions status. 
{% highlight json %}
 {
  "chain": [
    {
      "index": 1,
      "timestamp": 1531686938909,
      "transactions": [],
      "nonce": 100,
      "hash": "Genesis block",
      "prevBlockHash": "0"
    },
    {
      "index": 2,
      "timestamp": 1531686952090,
      "transactions": [
        {
          "amount": 1,
          "sender": "00000",
          "recipient": "sampleapp"
        }
      ],
      "nonce": 44,
      "hash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964",
      "prevBlockHash": "Genesis block"
    },
    {
      "index": 3,
      "timestamp": 1531686968213,
      "transactions": [
        {
          "amount": 190,
          "sender": "JACKIE",
          "recipient": "HELEN"
        },
        {
          "amount": 1,
          "sender": "00000",
          "recipient": "sampleapp"
        }
      ],
      "nonce": 71,
      "hash": "00766767c03993c1c5269bd531599c7e67f414c27f0d8bd56b5de2c7f5964e5f",
      "prevBlockHash": "00669af06fa8d395bea4f6325d39f43a3c87788152fc3050608aa23e55dfe964"
    }
  ],
  "pendingTransactions": []
}
{% endhighlight %}

Here we can see we recived the amount and also there is no much transactions. In this way we can use REST API to interact with our block chain.