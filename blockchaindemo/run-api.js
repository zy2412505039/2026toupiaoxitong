// run-api.js —— 独立启动区块链节点：P2P + Express API，绕开 Vorpal CLI
// 用法：node run-api.js [p2pPort] [apiPort]
// 示例：node run-api.js 2727 3001
const Blockchain = require('./Blockchain');
const P2p = require('./P2p');
const express = require('express');
const cors = require('cors');

const p2pPort = Number(process.argv[2]) || 2727;
const apiPort = Number(process.argv[3]) || 3001;

const blockchain = new Blockchain();
const p2p = new P2p(blockchain);

// 自动启动 P2P 监听
p2p.startServer(p2pPort);
console.log(`[P2P] 监听端口 ${p2pPort}`);

// 启动 Express API
const app = express();
app.use(cors());
app.use(express.json());

app.get('/blocks', (req, res) => {
  res.send(blockchain.blockchain);
});

app.post('/mineBlock', (req, res) => {
  const data = req.body.data;
  if (data == null) {
    res.status(400).send('data parameter is missing.');
    return;
  }
  blockchain.mine(data);
  const newBlock = blockchain.latestBlock;
  p2p.broadcastLatest();
  console.log(`[mine] 新区块 #${newBlock.index} data="${newBlock.data}"`);
  res.send(newBlock);
});

app.get('/peers', (req, res) => {
  res.send(
    p2p.peers.map((s) => {
      const host = s.peerInfo?.host || s.remoteAddress;
      const port = s.peerInfo?.port || s.remotePort;
      return `${host}:${port}`;
    }),
  );
});

app.get('/nodeInfo', (req, res) => {
  res.send({
    p2pPort: p2p.serverPort,
    apiPort: apiPort,
    blockCount: blockchain.blockchain.length,
    difficulty: blockchain.difficulty,
  });
});

app.post('/addPeer', (req, res) => {
  const peer = req.body.peer;
  if (!peer) {
    res.status(400).send('peer is required (格式: host:port)');
    return;
  }
  const idx = peer.lastIndexOf(':');
  if (idx === -1) {
    res.status(400).send('peer 格式错误，应为 host:port');
    return;
  }
  const host = peer.substring(0, idx);
  const port = Number(peer.substring(idx + 1));
  if (!host || !port) {
    res.status(400).send('host 和 port 不能为空');
    return;
  }
  try {
    p2p.connectToPeer(host, port);
    console.log(`[addPeer] 发起连接到 ${host}:${port}`);
    res.send({ ok: true, peer: `${host}:${port}`, note: 'TCP 连接异步建立，peer 列表稍后刷新可见' });
  } catch (e) {
    res.status(500).send('连接发起失败: ' + e.message);
  }
});

app.get('/health', (req, res) => {
  res.send({ ok: true, blocks: blockchain.blockchain.length, peers: p2p.peers.length });
});

app.listen(apiPort, () => {
  console.log(`[API]  Express 监听 http://localhost:${apiPort}`);
  console.log(`[info] 前端代理目标：/api/* → http://localhost:${apiPort}/*`);
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n[shutting down]');
  p2p.closeConnection();
  process.exit(0);
});
