// 非交互式后端入口 —— 直接启动 P2P + Express API
// 用法: node server.js <p2pPort> <apiPort>
// 例:  node server.js 2727 3001
const P2p = require('./P2p');
const Blockchain = require('./Blockchain');
const express = require('express');
const cors = require('cors');

const p2pPort = parseInt(process.argv[2], 10) || 2727;
const apiPort = parseInt(process.argv[3], 10) || 3001;

const blockchain = new Blockchain();
const p2p = new P2p(blockchain);

// 启动 P2P
p2p.startServer(p2pPort);
console.log(`[P2P] 监听端口 ${p2pPort}`);

// 启动 Express API
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, blocks: blockchain.blockchain.length, peers: p2p.peers.length });
});

app.get('/blocks', (req, res) => {
  res.json(blockchain.blockchain);
});

app.get('/nodeInfo', (req, res) => {
  res.json({
    p2pPort,
    apiPort,
    blockCount: blockchain.blockchain.length,
    difficulty: blockchain.difficulty,
  });
});

app.get('/peers', (req, res) => {
  res.json(
    p2p.peers.map((s) => {
      const host = s.peerInfo?.host || s.remoteAddress;
      const port = s.peerInfo?.port || s.remotePort;
      return `${host}:${port}`;
    })
  );
});

app.post('/mineBlock', (req, res) => {
  const data = req.body.data;
  if (data == null) {
    return res.status(400).send('data parameter is missing.');
  }
  blockchain.mine(data);
  const newBlock = blockchain.latestBlock;
  p2p.broadcastLatest();
  res.json(newBlock);
});

app.post('/addPeer', (req, res) => {
  try {
    const peerStr = req.body.peer;
    const [host, port] = peerStr.split(':');
    p2p.connectToPeer(host, parseInt(port, 10));
    res.json({ ok: true, msg: `正在连接 ${host}:${port}` });
  } catch (e) {
    res.status(400).json({ ok: false, msg: e.message });
  }
});

app.listen(apiPort, () => {
  console.log(`[API] 监听端口 ${apiPort}`);
  console.log(`\n✅ 节点就绪: P2P=${p2pPort}  API=http://localhost:${apiPort}`);
});
