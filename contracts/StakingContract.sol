// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakingContract
 * @dev vDOT 抵押合约，用于发放投票券
 * 支持多种锁定周期，提供不同倍率的投票券奖励
 */
contract StakingContract is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public vDOTToken;
    IERC20 public votingTicketToken;

    // 锁定选项配置
    struct LockOption {
        uint256 duration;     // 锁定天数
        uint256 multiplier;   // 奖励倍数 (精度: 10000 = 1.0)
        bool active;         // 是否激活
    }

    // 用户抵押信息
    struct StakeInfo {
        uint256 amount;       // 抵押数量
        uint256 lockDuration; // 锁定周期
        uint256 startTime;    // 开始时间
        uint256 endTime;      // 结束时间
        uint256 ticketsMinted; // 已铸造投票券数量
        bool active;         // 是否激活
    }

    // 锁定选项
    mapping(uint256 => LockOption) public lockOptions;
    // 用户抵押记录
    mapping(address => StakeInfo[]) public userStakes;
    // 总抵押量
    uint256 public totalStaked;

    // 事件
    event Staked(address indexed user, uint256 amount, uint256 lockDuration, uint256 ticketsMinted);
    event Unstaked(address indexed user, uint256 stakeIndex, uint256 amount);
    event LockOptionAdded(uint256 indexed optionId, uint256 duration, uint256 multiplier);
    event LockOptionUpdated(uint256 indexed optionId, uint256 duration, uint256 multiplier);
    event EmergencyWithdraw(address indexed token, uint256 amount);

    constructor(
        address _vDOTToken,
        address _votingTicketToken
    ) Ownable(msg.sender) {
        vDOTToken = IERC20(_vDOTToken);
        votingTicketToken = IERC20(_votingTicketToken);

        // 初始化锁定选项
        lockOptions[7] = LockOption(7 days, 10000, true);    // 7天 = 1.0倍
        lockOptions[30] = LockOption(30 days, 11000, true);  // 30天 = 1.1倍
        lockOptions[90] = LockOption(90 days, 13000, true);  // 90天 = 1.3倍
    }

    /**
     * @dev 抵押 vDOT 并获得投票券
     * @param amount 抵押数量
     * @param lockDuration 锁定周期（天数）
     */
    function stake(uint256 amount, uint256 lockDuration) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(lockOptions[lockDuration].active, "Lock option not available");
        require(vDOTToken.balanceOf(msg.sender) >= amount, "Insufficient vDOT balance");
        require(vDOTToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        LockOption memory option = lockOptions[lockDuration];
        uint256 ticketsToMint = calculateTickets(amount, lockDuration);

        // 转移 vDOT 到合约
        vDOTToken.safeTransferFrom(msg.sender, address(this), amount);

        // 铸造投票券给用户
        // 注意：这里需要调用投票券合约的铸造函数
        // votingTicketToken.mint(msg.sender, ticketsToMint);

        // 记录抵押信息
        StakeInfo memory stakeInfo = StakeInfo({
            amount: amount,
            lockDuration: lockDuration,
            startTime: block.timestamp,
            endTime: block.timestamp + (lockDuration * 1 days),
            ticketsMinted: ticketsToMint,
            active: true
        });

        userStakes[msg.sender].push(stakeInfo);
        totalStaked += amount;

        emit Staked(msg.sender, amount, lockDuration, ticketsToMint);
    }

    /**
     * @dev 解除抵押
     * @param stakeIndex 抵押记录索引
     */
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");

        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeIndex];
        require(stakeInfo.active, "Stake not active");
        require(block.timestamp >= stakeInfo.endTime, "Stake still locked");

        uint256 amount = stakeInfo.amount;

        // 返还 vDOT
        vDOTToken.safeTransfer(msg.sender, amount);

        // 销毁投票券
        // 注意：这里需要调用投票券合约的销毁函数
        // votingTicketToken.burn(msg.sender, stakeInfo.ticketsMinted);

        // 更新状态
        stakeInfo.active = false;
        totalStaked -= amount;

        emit Unstaked(msg.sender, stakeIndex, amount);
    }

    /**
     * @dev 计算投票券数量
     * @param amount 抵押金额
     * @param lockDuration 锁定周期
     * @return 投票券数量
     */
    function calculateTickets(uint256 amount, uint256 lockDuration) public view returns (uint256) {
        LockOption memory option = lockOptions[lockDuration];
        require(option.active, "Lock option not available");

        // 计算基础投票券数量：1 vDOT = 1 投票券
        uint256 baseTickets = amount;

        // 应用倍数奖励
        uint256 bonusTickets = (baseTickets * (option.multiplier - 10000)) / 10000;

        return baseTickets + bonusTickets;
    }

    /**
     * @dev 获取用户的抵押记录数量
     * @param user 用户地址
     * @return 抵押记录数量
     */
    function getUserStakeCount(address user) external view returns (uint256) {
        return userStakes[user].length;
    }

    /**
     * @dev 获取用户的抵押信息
     * @param user 用户地址
     * @param index 抵押记录索引
     * @return 抵押信息
     */
    function getUserStake(address user, uint256 index) external view returns (StakeInfo memory) {
        require(index < userStakes[user].length, "Invalid index");
        return userStakes[user][index];
    }

    /**
     * @dev 检查抵押是否可以解除
     * @param user 用户地址
     * @param stakeIndex 抵押记录索引
     * @return 是否可以解除
     */
    function canUnstake(address user, uint256 stakeIndex) external view returns (bool) {
        if (stakeIndex >= userStakes[user].length) return false;

        StakeInfo memory stakeInfo = userStakes[user][stakeIndex];
        return stakeInfo.active && block.timestamp >= stakeInfo.endTime;
    }

    /**
     * @dev 添加或更新锁定选项（仅管理员）
     * @param duration 锁定天数
     * @param multiplier 奖励倍数（精度: 10000 = 1.0）
     */
    function updateLockOption(uint256 duration, uint256 multiplier) external onlyOwner {
        require(multiplier >= 10000, "Multiplier must be >= 1.0");
        require(duration > 0, "Duration must be greater than 0");

        lockOptions[duration] = LockOption(duration * 1 days, multiplier, true);

        if (lockOptions[duration].duration == 0) {
            emit LockOptionAdded(duration, duration * 1 days, multiplier);
        } else {
            emit LockOptionUpdated(duration, duration * 1 days, multiplier);
        }
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
     * @dev 紧急提取代币（仅管理员）
     * @param token 代币地址
     * @param amount 提取数量
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdraw(token, amount);
    }

    /**
     * @dev 获取合约内 vDOT 余额
     */
    function getContractVDOTBalance() external view returns (uint256) {
        return vDOTToken.balanceOf(address(this));
    }

    /**
     * @dev 获取合约内投票券余额
     */
    function getContractTicketBalance() external view returns (uint256) {
        return votingTicketToken.balanceOf(address(this));
    }
}
