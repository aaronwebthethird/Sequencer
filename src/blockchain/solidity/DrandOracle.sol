// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract DrandOracle {
    uint256 public drandTimeout;

    mapping(uint256 => bytes32) public randomness;

    event RandomnessUpdated(uint256 indexed timestamp, bytes32 randomness);

    constructor(uint256 timeout) {
        drandTimeout = timeout;
    }

    function updateRandomnessForBlock(
        uint256 timestamp,
        bytes32 newRandomness
    ) external {
        require(
            block.timestamp <= timestamp + drandTimeout,
            "DrandOracle: Randomness update is too late."
        );

        randomness[timestamp] = newRandomness;

        require(
            randomness[timestamp] == newRandomness,
            "DrandOracle: State update failed."
        );

        emit RandomnessUpdated(timestamp, newRandomness);
    }

    function unsafeGetRandomnessForBlock(
        uint256 timestamp
    ) external view returns (bytes32) {
        return randomness[timestamp];
    }

    function getRandomnessForBlock(
        uint256 timestamp
    ) external view returns (bytes32) {
        require(
            randomness[timestamp] != 0,
            "DrandOracle: The randomness for timestamp not yet availble."
        );

        return randomness[timestamp];
    }

    function isRandomnessAvailable(
        uint256 timestamp
    ) external view returns (bool) {
        return
            randomness[timestamp] == 0 &&
            block.timestamp <= timestamp + drandTimeout;
    }
}
