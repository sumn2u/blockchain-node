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