// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {DrandOracle} from "../../src/blockchain/solidity/DrandOracle.sol";

contract DrandOracleTest is Test {
    DrandOracle public drandOracle;

    uint256 public constant TIMEOUT = 10;

    function setUp() public {
        drandOracle = new DrandOracle(TIMEOUT);
    }

    function test_given_valid_timestamp_when_updateRandomnessForBlock_then_randomness_updated()
        public
    {
        // Given
        bytes32 newRandom = keccak256(abi.encodePacked("10"));
        uint256 timestamp = block.timestamp;

        // When
        drandOracle.updateRandomnessForBlock(timestamp, newRandom);

        //Then
        assertEq(drandOracle.unsafeGetRandomnessForBlock(timestamp), newRandom);
    }

    function test_given_invalid_timestamp_updateRandomnessForBlock_then_revert()
        public
    {
        // Given
        bytes32 newRandom = keccak256(abi.encodePacked("20"));
        uint256 timestamp = 1;

        //set current timestamp to 15
        vm.warp(15);

        vm.expectRevert("DrandOracle: Randomness update is too late.");

        //Then
        drandOracle.updateRandomnessForBlock(timestamp, newRandom);
    }

    function test_given_value_set_unsafeGetRandomnessForBlock_then_randomness_returned()
        public
    {
        // Given
        bytes32 newRandom = keccak256(abi.encodePacked("30"));
        uint256 timestamp = block.timestamp;

        // When
        drandOracle.updateRandomnessForBlock(timestamp, newRandom);

        // Then
        assertEq(drandOracle.unsafeGetRandomnessForBlock(1), newRandom);
    }

    function test_given_no_value_set_when_unsafeGetRandomnessForBlock_then_return_0()
        public
        view
    {
        // Then
        assertEq(drandOracle.unsafeGetRandomnessForBlock(1), 0);
    }

    function test_given_value_set_when_getRandomnessForBlock_then_randomness_returned()
        public
    {
        // Given
        bytes32 newRandom = keccak256(abi.encodePacked("40"));
        uint256 timestamp = block.timestamp;

        // When
        drandOracle.updateRandomnessForBlock(timestamp, newRandom);

        //Then
        assertEq(drandOracle.getRandomnessForBlock(timestamp), newRandom);
    }

    function test_given_invalid_timestamp_when_getRandomnessForBlock_then_revert()
        public
    {
        // Given
        uint256 timestamp = block.timestamp;

        vm.expectRevert(
            "DrandOracle: The randomness for timestamp not yet availble."
        );

        //Then
        drandOracle.getRandomnessForBlock(timestamp);
    }

    function test_given_valid_timestamp_when_isRandomnessAvailable_then_randomness_is_available()
        public
        view
    {
        //Given
        uint256 timestamp = block.timestamp;

        assertEq(drandOracle.isRandomnessAvailable(timestamp), true);
    }

    function test_given_invalid_timestamp_when_isRandomnessAvailable_then_randomness_is_unavailable()
        public
    {
        //Given
        uint256 timestamp = block.timestamp;
        vm.warp(15);

        assertEq(drandOracle.isRandomnessAvailable(timestamp), false);
    }
}
