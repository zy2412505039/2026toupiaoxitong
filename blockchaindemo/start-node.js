// 非交互式启动后端节点：自动执行 open + api + 保持运行
const vorpal = require('vorpal')();
vorpal.use(require('./cli'));

const args = process.argv.slice(2);
const p2pPort = args[0] || '2727';
const apiPort = args[1] || '3001';

async function boot() {
  await vorpal.exec(`open ${p2pPort}`);
  await vorpal.exec(`api ${apiPort}`);
  console.log(`\n🚀 节点已启动：P2P=${p2pPort}  API=${apiPort}`);
  console.log('输入 help 查看命令，exit 退出。\n');
  vorpal.show();
}

boot().catch((e) => { console.error(e); process.exit(1); });
