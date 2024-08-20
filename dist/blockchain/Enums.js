"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = void 0;
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["Pending"] = 1] = "Pending";
    TransactionStatus[TransactionStatus["InProgress"] = 2] = "InProgress";
    TransactionStatus[TransactionStatus["Completed"] = 3] = "Completed";
    TransactionStatus[TransactionStatus["GasFailure"] = 5] = "GasFailure";
    TransactionStatus[TransactionStatus["NonceFailure"] = 6] = "NonceFailure";
    TransactionStatus[TransactionStatus["ExecutionFailure"] = 7] = "ExecutionFailure";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
