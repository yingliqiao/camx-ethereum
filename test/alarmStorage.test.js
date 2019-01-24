/*

Test suite for AlarmStorage.sol smart contract

*/
const truffleAssert = require("truffle-assertions");

const AlarmStorage = artifacts.require("./AlarmStorage.sol");
const web3 = AlarmStorage.web3;

contract("AlarmStorage", function(accounts) {

    const owner = accounts[0];
    const ava = accounts[1];
    const bob = accounts[2];

    const udid = "7A6C22A6-6247-452F-9865-3F276B526485";
    const ipfsHash = "QmSehVuH9vqgumD18v2XaN7FtRmW6RS15HrfsxkDQT6T4X";

    it("should save correct IPFS hash", async () => {
        const alarmStorage = await AlarmStorage.deployed();

        const result = await alarmStorage.saveHash(udid, ipfsHash, {value: web3.utils.toWei("0.001", "ether"), from: ava});
        const savedHash = await alarmStorage.getHash(udid, {from: ava});
        assert.equal(ava, savedHash[0], "IPFS hash sender incorrect, check saveHash method");
        assert.equal(ipfsHash, savedHash[1], "IPFS hash incorrect, check saveHash method");

        const expectedEvent = {_sender: ava, _value: ipfsHash};
        const logSender = result.logs[0].args._sender;
        const logValue = result.logs[0].args._value;
        assert.equal(expectedEvent._sender, logSender, "LogsaveHash event _sender property not emitted, check saveHash method");
        assert.equal(expectedEvent._value, logValue, "LogsaveHash event _value property not emitted, chec, saveHash method");  
    });

    it("should fail to save IPFS hash if sufficient service fee isn't paid", async () => {
        const alarmStorage = await AlarmStorage.deployed();

        await truffleAssert.fails(alarmStorage.saveHash(udid, ipfsHash, {value: web3.utils.toWei("0.0009", "ether"), from: bob}),
            truffleAssert.ErrorType.REVERT,
            "Not paid enough service fee"
        );  
    });

    it("should transfer owner successfully", async () => {
        const alarmStorage = await AlarmStorage.deployed();

        const result = await alarmStorage.transferOwner(ava, {from: owner});
        const newOwner = await alarmStorage.getOwner({from: bob});
        assert.equal(ava, newOwner, "Transfer owner failed, check transferOwner method")

        const expectedEvent = {_owner: owner, _newOwner: ava};
        const logOwner = result.logs[0].args._owner;
        const logNewOwner = result.logs[0].args._newOwner;
        assert.equal(expectedEvent._owner, logOwner, "LogTransferOwner event _owner property not emitted, check transferOwner method");
        assert.equal(expectedEvent._newOwner, logNewOwner, "LogTransferOwner event _newOwner property not emitted, check transferOwner method");
    });

    it("should withdraw amount successfully", async () => {
        const alarmStorage = await AlarmStorage.deployed();

        var oldBalance = await web3.eth.getBalance(ava);
        const amount = web3.utils.toWei("1", "ether");
        
        await alarmStorage.saveHash(udid, ipfsHash, {value: amount, from: bob});
        const result = await alarmStorage.withdraw(amount, {from: ava});
        const txHash = await result.logs[0].transactionHash;
        const transaction = await web3.eth.getTransaction(txHash);
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const cost = transaction.gasPrice * receipt.gasUsed;
        var newBalance = await web3.eth.getBalance(ava);
        
        assert.equal(web3.utils.toBN(oldBalance).add(web3.utils.toBN(amount)).sub(web3.utils.toBN(cost)).toString(), 
                     web3.utils.toBN(newBalance).toString(), 
                     "Withdraw failed, check withdraw method");

        const expectedEvent = {_owner: ava, _amount: amount};
        const logOwner = result.logs[0].args._owner;
        const logAmount = result.logs[0].args._amount;
        assert.equal(expectedEvent._owner, logOwner, "LogWithdraw event _owner property not emitted, check withdraw method");
        assert.equal(expectedEvent._amount, logAmount, "LogWithdraw event _amount property not emitted, check transferOwner method");
    });

    it("should fail to withdraw amount if it's not owner", async() => {
        const alarmStorage = await AlarmStorage.deployed();

        await truffleAssert.fails(alarmStorage.withdraw(web3.utils.toWei("0.001"), {from:bob}),
            truffleAssert.ErrorType.REVERT,
            "It is not owner"
        );
    });
});