# camx-ethereum

This is the Truffle project for alarm storage smart contract which stores IPFS hash that stores object detection alarm information generated from iOS devices. [cam X](https://github.com/yingliqiao/camX) is the iOS app I developed to interact with this smart contract.

# User Guide

1. Install Node.js, npm, Truffle Framework, Ganache-cli

2. Run "npm install --save-dev chai truffle-assertions" to install chai and truffle-assertions libraries.

3. Run "Truffle compile" to compile the contract.

4. Run "Truffle migrate" to migrate contracts to locally running ganache-cli test blockchain on port 8545

5. Run "Truffle test" to run test suite.
