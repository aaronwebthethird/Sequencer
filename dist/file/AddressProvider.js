"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const AddressProvider = () => {
    const getContractAddress = () => {
        try {
            const data = fs_1.default.readFileSync('./broadcast/Deploy.s.sol/31337/run-latest.json', 'utf8');
            // 
            const jsonData = JSON.parse(data);
            console.log(jsonData);
            return jsonData.receipts[0].contractAddress;
        }
        catch (err) {
            console.error(err);
        }
    };
    return {
        getContractAddress
    };
};
exports.default = AddressProvider;
