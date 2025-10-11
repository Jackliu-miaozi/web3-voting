// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVotingContract
 * @dev Interface for VotingContract to check voting period status
 */
interface IVotingContract {
    function currentVotingPeriodId() external view returns (uint256);
    
    function votingPeriods(uint256 periodId) external view returns (
        uint256 startTime,
        uint256 endTime,
        bool active,
        bool resolved,
        uint8 correctAnswer
    );
}



