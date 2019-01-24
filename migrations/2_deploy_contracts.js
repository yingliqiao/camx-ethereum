var AlarmStorage = artifacts.require("./AlarmStorage.sol");

module.exports = function(deployer) {
    deployer.deploy(AlarmStorage);
}