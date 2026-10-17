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

  // 从合约中获取候选人真实数据
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
        provider,
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
      console.log(error, "其他错误+++++++++++++++++555555555");
    } finally {
      setLoading(false);
    }
  };

  // 监听account状态变动，首次加载及切换时自动拉取链上的候选人数据
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchContractData(account);
  }, [account]);

  // 页面初始化时检查已连接的状态，并注册账号/切换监听
  useEffect(() => {
    if (!window.ethereum) return;

    // 1. 自动检查是否授权过
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      })
      .catch((error) => {
        console.error(error, "其他错误1111111111111111111111");
      });

    // 2. 监听账户切换事件(在metamask切换账号或断开连接时候触发)
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        setSelectedId("");
      }
    };

    // 3. 监听网络的切换事件(在metamask切换网络时候触发)
    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // 4. 组件卸载时移除监听，防止内存泄漏
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // 连接/断开钱包
  const handleConnectWallet = async () => {
    // 1. 检查浏览器是否已经安装了metamask钱包
    if (!window.ethereum) {
      alert("请安装Metamask钱包");
      return;
    }

    // 2. 如果是当前已处于连接状态，点击则执行前端层面的断开重置
    if (account) {
      setAccount(null);
      setSelectedId("");
      return;
    }

    // 3. 唤起metamask弹窗连接请求
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      if (error.code === 4801) {
        console.warn("用户拒绝了连接请求");
      } else {
        console.log(error, "其他错误");
      }
    }
  };

  // 投票：发交易到链上
  const handleVote = async () => {
    // 1. 前置安全校验：未选择候选人、未连接钱包或无 window.ethereum 时直接拦截
    if (selectedId === "" || !account || !window.ethereum) {
      return;
    }

    // 2. 乐观更新：先在界面上把票数 +1，交易确认后再用链上数据覆盖
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === Number(selectedId)
          ? { ...c, voteCount: c.voteCount + 1 }
          : c,
      ),
    );

    try {
      setLoading(true);
      // 3. 创建 provider，并获取当前钱包账户的签名者
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // 4. 创建带有 signer 签名的合约实例（具备写权限）
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );
      // 5. 调用合约方法 vote，此步骤会自动唤起 MetaMask 弹窗
      const tx = await contract.vote(selectedId);
      console.log(tx.hash, "交易hash");
      // 6. 等待交易区块确认(mining)
      await tx.wait();
      console.log("交易打包成功");

      // 7. 重新获取链上数据（会同时刷新票数和 hasVoted 状态）
      await fetchContractData(account);
      setSelectedId("");
      alert("投票成功！");
    } catch (error) {
      // 投票失败/被拒绝：从链上重新拉取真实票数，纠正乐观更新
      fetchContractData(account);
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        console.warn("用户拒绝了投票请求");
      } else if (error.reason) {
        // 合约 require 回滚等错误
        console.log(error.reason);
        alert(`投票失败:${error.reason}`);
      } else {
        console.log(error, "投票失败");
        alert("投票失败，请控制台查看信息");
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
