// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title BTCOracle
 * @dev 比特币市值预言机合约
 * 集成 Chainlink 数据源，定期获取比特币市值数据并判定投票结果
 */
contract BTCOracle is Ownable, Pausable {
    // Chainlink 数据源接口
    AggregatorV3Interface internal btcPriceFeed;
    AggregatorV3Interface internal ethPriceFeed;
    AggregatorV3Interface internal bnbPriceFeed;

    // 市值阈值配置
    struct MarketCapThreshold {
        uint256 btcMarketCap;      // 比特币市值阈值（美元）
        uint256 competitorCap;     // 竞争链市值阈值（美元）
        bool isActive;             // 是否激活
    }

    // 投票结果判定
    enum VoteResult {
        BTC_DOMINANT,    // 比特币仍占主导
        COMPETITOR_WIN,  // 竞争链获胜
        PENDING          // 待定
    }

    // 投票期数据快照
    struct MarketSnapshot {
        uint256 timestamp;
        uint256 btcMarketCap;
        uint256 ethMarketCap;
        uint256 bnbMarketCap;
        VoteResult result;
    }

    // 常量
    uint256 public constant SNAPSHOT_INTERVAL = 24 hours; // 快照间隔
    uint256 public constant VOTING_DURATION = 365 days;   // 投票持续时间

    // 状态变量
    mapping(uint256 => MarketSnapshot[]) public votingPeriodSnapshots;
    mapping(uint256 => MarketCapThreshold) public thresholds;
    mapping(uint256 => uint256) public lastSnapshotTime;

    address public votingContract; // 投票合约地址
    uint256 public currentVotingPeriod;

    // 事件
    event MarketSnapshotTaken(uint256 indexed votingPeriodId, uint256 btcCap, uint256 ethCap, uint256 bnbCap);
    event ThresholdUpdated(uint256 indexed votingPeriodId, uint256 btcThreshold, uint256 competitorThreshold);
    event VotingContractUpdated(address oldContract, address newContract);

    constructor(
        address _btcPriceFeed,
        address _ethPriceFeed,
        address _bnbPriceFeed,
        address _votingContract
    ) Ownable(msg.sender) {
        btcPriceFeed = AggregatorV3Interface(_btcPriceFeed);
        ethPriceFeed = AggregatorV3Interface(_ethPriceFeed);
        bnbPriceFeed = AggregatorV3Interface(_bnbPriceFeed);
        votingContract = _votingContract;

        // 初始化第一个投票期阈值
        currentVotingPeriod = 1;
        thresholds[1] = MarketCapThreshold({
            btcMarketCap: 1000000000000, // 1万亿美元
            competitorCap: 500000000000,  // 5000亿美元
            isActive: true
        });
    }

    /**
     * @dev 获取最新价格数据
     * @param priceFeed 价格源合约地址
     * @return 价格（精度：8位小数）
     */
    function getLatestPrice(AggregatorV3Interface priceFeed) internal view returns (int256) {
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @dev 获取代币市值（简化计算：价格 * 流通供应量）
     * 注意：实际项目中应该使用更准确的市值数据源
     * @param price 价格
     * @param supply 流通供应量
     * @return 市值（美元）
     */
    function calculateMarketCap(int256 price, uint256 supply) internal pure returns (uint256) {
        require(price > 0, "Invalid price");
        return uint256(price) * supply / 1e8; // Chainlink 返回8位精度
    }

    /**
     * @dev 拍摄市场快照并判定结果
     * @param votingPeriodId 投票期ID
     */
    function takeMarketSnapshot(uint256 votingPeriodId) external whenNotPaused {
        require(thresholds[votingPeriodId].isActive, "Threshold not set for voting period");
        require(
            block.timestamp >= lastSnapshotTime[votingPeriodId] + SNAPSHOT_INTERVAL,
            "Snapshot interval not reached"
        );

        // 获取市值数据
        (uint256 btcMarketCap, uint256 ethMarketCap, uint256 bnbMarketCap) = _getMarketCaps();
        
        // 判定结果并保存快照
        VoteResult result = _determineAndSaveSnapshot(votingPeriodId, btcMarketCap, ethMarketCap, bnbMarketCap);

        // 如果投票期结束且有明确结果，通知投票合约
        if (block.timestamp >= getVotingEndTime(votingPeriodId) && result != VoteResult.PENDING) {
            // 这里需要调用投票合约的开奖函数
            // 注意：需要确保投票合约授权本合约调用开奖函数
        }
    }

    /**
     * @dev 获取市值数据
     */
    function _getMarketCaps() internal view returns (uint256, uint256, uint256) {
        // 获取最新价格
        int256 btcPrice = getLatestPrice(btcPriceFeed);
        int256 ethPrice = getLatestPrice(ethPriceFeed);
        int256 bnbPrice = getLatestPrice(bnbPriceFeed);

        // 简化计算：使用固定供应量（实际项目中应从数据源获取）
        uint256 btcSupply = 19500000; // 比特币流通供应量（约1950万）
        uint256 ethSupply = 120000000; // 以太坊流通供应量（约1.2亿）
        uint256 bnbSupply = 155000000; // BNB流通供应量（约1.55亿）

        // 计算市值
        uint256 btcMarketCap = calculateMarketCap(btcPrice, btcSupply);
        uint256 ethMarketCap = calculateMarketCap(ethPrice, ethSupply);
        uint256 bnbMarketCap = calculateMarketCap(bnbPrice, bnbSupply);

        return (btcMarketCap, ethMarketCap, bnbMarketCap);
    }

    /**
     * @dev 判定结果并保存快照
     */
    function _determineAndSaveSnapshot(
        uint256 votingPeriodId,
        uint256 btcMarketCap,
        uint256 ethMarketCap,
        uint256 bnbMarketCap
    ) internal returns (VoteResult) {
        // 获取竞争链最大市值（ETH 或 BNB）
        uint256 maxCompetitorCap = ethMarketCap > bnbMarketCap ? ethMarketCap : bnbMarketCap;

        // 判定结果
        MarketCapThreshold memory threshold = thresholds[votingPeriodId];
        VoteResult result;

        if (btcMarketCap >= threshold.btcMarketCap) {
            result = VoteResult.BTC_DOMINANT;
        } else if (maxCompetitorCap >= threshold.competitorCap) {
            result = VoteResult.COMPETITOR_WIN;
        } else {
            result = VoteResult.PENDING;
        }

        // 保存快照
        MarketSnapshot memory snapshot = MarketSnapshot({
            timestamp: block.timestamp,
            btcMarketCap: btcMarketCap,
            ethMarketCap: ethMarketCap,
            bnbMarketCap: bnbMarketCap,
            result: result
        });

        votingPeriodSnapshots[votingPeriodId].push(snapshot);
        lastSnapshotTime[votingPeriodId] = block.timestamp;

        emit MarketSnapshotTaken(votingPeriodId, btcMarketCap, ethMarketCap, bnbMarketCap);

        return result;
    }

    /**
     * @dev 获取投票期结束时间
     * @param votingPeriodId 投票期ID
     */
    function getVotingEndTime(uint256 votingPeriodId) public view returns (uint256) {
        // 这里应该从投票合约获取投票期信息
        // 暂时使用固定时间作为示例
        return block.timestamp - (block.timestamp % VOTING_DURATION) + VOTING_DURATION;
    }

    /**
     * @dev 获取投票期的最新快照
     * @param votingPeriodId 投票期ID
     */
    function getLatestSnapshot(uint256 votingPeriodId) external view returns (MarketSnapshot memory) {
        MarketSnapshot[] memory snapshots = votingPeriodSnapshots[votingPeriodId];
        require(snapshots.length > 0, "No snapshots available");
        return snapshots[snapshots.length - 1];
    }

    /**
     * @dev 获取投票期的所有快照
     * @param votingPeriodId 投票期ID
     */
    function getVotingPeriodSnapshots(uint256 votingPeriodId) external view returns (MarketSnapshot[] memory) {
        return votingPeriodSnapshots[votingPeriodId];
    }

    /**
     * @dev 设置投票期阈值（仅管理员）
     * @param votingPeriodId 投票期ID
     * @param btcThreshold 比特币市值阈值
     * @param competitorThreshold 竞争链市值阈值
     */
    function setThreshold(
        uint256 votingPeriodId,
        uint256 btcThreshold,
        uint256 competitorThreshold
    ) external onlyOwner {
        thresholds[votingPeriodId] = MarketCapThreshold({
            btcMarketCap: btcThreshold,
            competitorCap: competitorThreshold,
            isActive: true
        });

        emit ThresholdUpdated(votingPeriodId, btcThreshold, competitorThreshold);
    }

    /**
     * @dev 更新投票合约地址（仅管理员）
     * @param newVotingContract 新投票合约地址
     */
    function updateVotingContract(address newVotingContract) external onlyOwner {
        require(newVotingContract != address(0), "Invalid contract address");
        address oldContract = votingContract;
        votingContract = newVotingContract;

        emit VotingContractUpdated(oldContract, newVotingContract);
    }

    /**
     * @dev 获取BTC价格
     */
    function getBTCPrice() external view returns (int256) {
        return getLatestPrice(btcPriceFeed);
    }

    /**
     * @dev 获取ETH价格
     */
    function getETHPrice() external view returns (int256) {
        return getLatestPrice(ethPriceFeed);
    }

    /**
     * @dev 获取BNB价格
     */
    function getBNBPrice() external view returns (int256) {
        return getLatestPrice(bnbPriceFeed);
    }

    /**
     * @dev 暂停合约（紧急情况）
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev 检查快照是否可用
     * @param votingPeriodId 投票期ID
     */
    function canTakeSnapshot(uint256 votingPeriodId) external view returns (bool) {
        return block.timestamp >= lastSnapshotTime[votingPeriodId] + SNAPSHOT_INTERVAL;
    }
}
