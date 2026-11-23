// 定义一个区块的类，定义我们此项目区块链中的每个区块的数据结构
class Block {
  constructor(index, previousHash, timestamp, data, hash, nonce) {
    this.index = index;         // 区块的索引
    this.previousHash = previousHash; // 前一个区块的哈希值
    this.timestamp = timestamp;  // 区块的时间戳
    this.data = data;            // 区块的数据
    this.hash = hash;            // 区块的哈希值
    this.nonce = nonce;          // 区块的nonce值
  }

  // 定义一个创世区块（hash 由当前 calculateHash 算法挖出，难度 3，nonce 161）
  static get genesis() {
    return new Block(
      0,
      "0",
      1508270000000,
      "Genesis Block",
      "0009f9b788623abefa9e10f62c433482deffbf52a0ec23d633287bfbc90eb1ed",
      161,
    );
  }
}

// 导出区块类，让其他文件可以使用
module.exports = Block;
