import { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header.jsx";
import CandidateVotes from "./components/CandidateVotes.jsx";
import VoteSection from "./components/VoteSection.jsx";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contracts/config.js";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [candidates, setCandidates] = useState([]);

  // 从合约获取候选人数据
  const fetchContractData = async (currentAccount) => {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const rawCandidates = await contract.getCandidates();
      const formattedCandidates = rawCandidates.map((c) => ({
        id: Number(c.id),
        name: c.name,
        voteCount: Number(c.voteCount),
      }));
      setCandidates(formattedCandidates);
      if (currentAccount) {
        const voted = await contract.checkIfVoted(currentAccount);
        setHasVoted(voted);
      } else {
        setHasVoted(false);
      }
    } catch (error) {
      console.log(error, "其他错误++++++++++++55555555");
    } finally {
      setLoading(false);
    }
  };

  // 监听account变化，自动拉取合约数据
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchContractData(account);
  }, [account]);

  // 钱包连接函数
  const handleConnectWallet = async () => {
    // 1.检查是否安装metamask
    if (!window.ethereum) {
      alert("请安装metamask钱包");
      return;
    }
    // 2.如果已经连接，点击重置
    if (account) {
      setAccount(null);
      setSelectedId("");
      return;
    }
    // 3.发起钱包连接请求
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      if (error.code === 4001) {
        console.warn("用户拒绝了连接请求");
      } else {
        console.log(error, "其他错误");
      }
    }
  };

  // 投票提交函数
  const handleVote = async () => {
    // 前置校验
    if (selectedId === "" || !account || !window.ethereum) {
      return;
    }
    try {
      setLoading(true);
      // 获取签名器
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      // 调用合约vote方法（合约要求 uint256，需转数值）
      const tx = await contract.vote(Number(selectedId));
      console.log(tx.hash, "++++++++++++++");
      await tx.wait();
      console.log("交易打包成功");
      // 刷新数据
      await fetchContractData(account);
      setSelectedId("");
      alert("投票成功！");
    } catch (error) {
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        console.warn("用户拒绝了投票请求");
      } else if (error.reason) {
        // 合约 require 回滚，如 "You have already voted"
        console.log(error.reason);
        alert(`投票失败：${error.reason}`);
      } else {
        console.log(error, "投票失败++++");
        alert("投票失败，请查看控制台信息");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voting-card">
      <Header account={account} />
      <CandidateVotes loading={loading} candidates={candidates} />
      <VoteSection
        account={account}
        hasVoted={hasVoted}
        candidates={candidates}
        selectedId={selectedId}
        onSelectCandidate={setSelectedId}
        onVote={handleVote}
        onConnectWallet={handleConnectWallet}
      />
    </div>
  );
}

export default App;
