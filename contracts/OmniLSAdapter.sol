// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title OmniLSAdapter
 * @dev 最简 Omni LS 适配器 - 直接集成 Bifrost SLPx
 * 在 Moonbase Alpha 上部署的最简单方案
 */
contract OmniLSAdapter is ERC20, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for ERC20;

    // SLPx 相关地址（需要在部署时配置）
    address public oracle;           // Bifrost Oracle 合约地址
    address public dispatcher;       // Bifrost Dispatcher 合约地址
    address public underlyingToken;  // 底层质押代币（如 DOT）

    // Bifrost 链 ID 和 SLPx 合约地址
    uint256 public constant BIFROST_CHAIN_ID = 2030; // Bifrost Polkadot parachain ID
    address public constant BIFROST_SLPX = address(1); // Bifrost SLPx 合约地址（占位符）

    // 铸造周期计数
    uint256 public currentCycleMintTokenAmount;
    uint256 public currentCycleMintVTokenAmount;
    uint256 public currentCycleRedeemVTokenAmount;

    // 赎回队列
    struct RedeemRequest {
        address receiver;
        uint256 assets;
        uint256 startTime;
    }

    mapping(uint256 => RedeemRequest) public redeemQueue;
    mapping(address => uint256[]) public userRedeemRequests;
    uint256 public redeemQueueIndex;
    uint256 public nextRequestId = 1;

    // 最大赎回请求数限制
    uint256 public maxRedeemRequestsPerUser = 10;

    // 触发地址（用于自动化操作）
    address public triggerAddress;

    // 枚举类型（参考 Bifrost 代码）
    enum AsyncOperation {
        MINT,
        REDEEM
    }

    enum StateMachine {
        polkadot
    }

    struct DispatchPost {
        bytes body;
        StateMachine dest;
        uint64 timeout;
        address to;
        uint128 fee;
        address payer;
    }

    // 事件
    event AsyncMintCompleted(uint256 tokenAmount, uint256 vTokenAmount);
    event AsyncRedeemCompleted(uint256 vTokenAmount);
    event RedeemRequestSuccess(uint256 requestId, address receiver, uint256 assets, uint256 startTime, uint256 finishTime);
    event OracleChanged(address oldOracle, address newOracle);
    event DispatcherChanged(address oldDispatcher, address newDispatcher);

    constructor(
        string memory name,
        string memory symbol,
        address _underlyingToken,
        address _oracle,
        address _dispatcher
    ) ERC20(name, symbol) Ownable(msg.sender) {
        underlyingToken = _underlyingToken;
        oracle = _oracle;
        dispatcher = _dispatcher;
    }

    // =================== 管理员函数 ===================

    function setOracle(address _oracle) external onlyOwner {
        address oldOracle = oracle;
        oracle = _oracle;
        emit OracleChanged(oldOracle, _oracle);
    }

    function setDispatcher(address _dispatcher) external onlyOwner {
        address oldDispatcher = dispatcher;
        dispatcher = _dispatcher;
        emit DispatcherChanged(oldDispatcher, _dispatcher);
    }

    function setTriggerAddress(address _triggerAddress) external onlyOwner {
        triggerAddress = _triggerAddress;
    }

    // =================== 铸造和赎回函数 ===================

    /**
     * @dev 存款并铸造 vToken（简化版）
     */
    function deposit(uint256 assets, address receiver) external nonReentrant whenNotPaused returns (uint256) {
        require(assets > 0, "Assets must be greater than 0");

        // 转移底层资产到合约
        ERC20(underlyingToken).safeTransferFrom(msg.sender, address(this), assets);

        // 计算将获得的 vToken 数量（简化：1:1）
        uint256 vTokenAmount = assets;

        // 累计铸造量
        currentCycleMintTokenAmount += assets;
        currentCycleMintVTokenAmount += vTokenAmount;

        // 铸造 vToken 给用户
        _mint(receiver, vTokenAmount);

        return vTokenAmount;
    }

    /**
     * @dev 赎回 vToken（简化版）
     */
    function redeem(uint256 shares, address receiver, address owner) external nonReentrant whenNotPaused returns (uint256) {
        require(shares > 0, "Shares must be greater than 0");
        require(balanceOf(owner) >= shares, "Insufficient balance");

        // 检查赎回请求限制
        require(userRedeemRequests[owner].length < maxRedeemRequestsPerUser, "Too many redeem requests");

        // 计算赎回的资产数量（简化：1:1）
        uint256 assets = shares;

        // 销毁 vToken
        _burn(owner, shares);

        // 创建赎回请求
        uint256 requestId = nextRequestId++;
        redeemQueue[requestId] = RedeemRequest({
            receiver: receiver,
            assets: assets,
            startTime: block.timestamp
        });
        userRedeemRequests[owner].push(requestId);

        // 累计赎回量
        currentCycleRedeemVTokenAmount += shares;

        return assets;
    }

    // =================== 跨链操作函数 ===================

    /**
     * @dev 异步铸造 - 发送铸造请求到 Bifrost
     */
    function asyncMint() external {
        require(msg.sender == triggerAddress || msg.sender == owner(), "Not authorized");

        require(currentCycleMintTokenAmount > 0, "No tokens to mint");
        require(currentCycleMintVTokenAmount > 0, "No vTokens to mint");

        // 发送铸造请求到 Bifrost（简化版）
        _sendCrossChainMessage(
            abi.encode(block.chainid, AsyncOperation.MINT, currentCycleMintTokenAmount, currentCycleMintVTokenAmount)
        );

        // 重置计数器
        uint256 tokenAmount = currentCycleMintTokenAmount;
        uint256 vTokenAmount = currentCycleMintVTokenAmount;
        currentCycleMintVTokenAmount = 0;
        currentCycleMintTokenAmount = 0;

        emit AsyncMintCompleted(tokenAmount, vTokenAmount);
    }

    /**
     * @dev 异步赎回 - 发送赎回请求到 Bifrost
     */
    function asyncRedeem() external {
        require(msg.sender == triggerAddress || msg.sender == owner(), "Not authorized");

        require(currentCycleRedeemVTokenAmount > 0, "No vTokens to redeem");

        // 发送赎回请求到 Bifrost（简化版）
        _sendCrossChainMessage(
            abi.encode(block.chainid, AsyncOperation.REDEEM, currentCycleRedeemVTokenAmount)
        );

        // 重置计数器
        uint256 vTokenAmount = currentCycleRedeemVTokenAmount;
        currentCycleRedeemVTokenAmount = 0;

        emit AsyncRedeemCompleted(vTokenAmount);
    }

    /**
     * @dev 批量处理赎回请求（简化版）
     */
    function batchClaim(uint256 batchSize) external {
        require(msg.sender == triggerAddress || msg.sender == owner(), "Not authorized");

        uint256 actualBatchSize = nextRequestId - redeemQueueIndex;
        if (batchSize > actualBatchSize) {
            batchSize = actualBatchSize;
        }

        // 处理赎回请求
        for (uint256 i = redeemQueueIndex; i < redeemQueueIndex + batchSize; i++) {
            RedeemRequest memory request = redeemQueue[i];
            if (request.assets > 0) {
                // 转移资产给用户（简化：假设资产已在合约中）
                ERC20(underlyingToken).safeTransfer(request.receiver, request.assets);

                // 清理赎回请求
                delete redeemQueue[i];

                emit RedeemRequestSuccess(i, request.receiver, request.assets, request.startTime, block.timestamp);
            }
        }

        redeemQueueIndex += batchSize;
    }

    /**
     * @dev 发送跨链消息（简化实现）
     */
    function _sendCrossChainMessage(bytes memory messageBody) internal {
        // 注意：这是一个简化的实现
        // 实际部署时需要：
        // 1. 集成 Bifrost 的跨链消息传递机制
        // 2. 使用正确的 Dispatcher 合约
        // 3. 处理消息路由和验证

        // 这里只是记录消息，实际跨链逻辑需要与 Bifrost 集成
        // 生产环境中应该使用 Bifrost 提供的 Dispatcher 合约
    }

    // =================== 视图函数 ===================

    function totalAssets() public view returns (uint256) {
        // 返回合约中的底层资产总量
        return ERC20(underlyingToken).balanceOf(address(this));
    }

    function getUserRedeemRequests(address user) external view returns (RedeemRequest[] memory) {
        uint256[] memory requestIds = userRedeemRequests[user];
        RedeemRequest[] memory requests = new RedeemRequest[](requestIds.length);
        for (uint256 i = 0; i < requestIds.length; i++) {
            requests[i] = redeemQueue[requestIds[i]];
        }
        return requests;
    }

    // =================== 紧急控制 ===================

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // =================== ERC20 重写 ===================

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
