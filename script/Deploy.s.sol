// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {DrandOracle} from "../src/blockchain/solidity/DrandOracle.sol";
import {console} from "forge-std/console.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        DrandOracle contractInstance = new DrandOracle(10);
        address contractAddress = address(contractInstance);

        console.log("DrandOracle address: ", contractAddress);

        vm.stopBroadcast();
    }
}
