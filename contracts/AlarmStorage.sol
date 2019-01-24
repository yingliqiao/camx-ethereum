pragma solidity ^0.5.0;

/** @title Alarm Storage contract */
contract AlarmStorage {
  
    // IPFS hash structure
    struct IPFSHash {

        // Sender address
        address sender;

        // IPFS hash value
        string value;
    }

    // Contract running state
    bool private stopped = false;

    // Alarm Storage contract owner
    address private owner;

    // iOS device UDID to IPFSHash structure mapping
    mapping(string => IPFSHash) internal hashes;

    // Service fee in Wei
    uint public fee = 0.001 ether;

    // Event for tranfer owner
    event LogTransferOwner(address _owner, address _newOwner);

    // Event for withdraw ETH
    event LogWithdraw(address _owner, uint _amount);

    // Event for save IPFS hash
    event LogSaveHash(address _sender, string _value);

    // Verify owner
    modifier verifyOwner() {
        require(msg.sender == owner, "It is not owner");
        _;
    }

    // Suspend execution
    modifier suspend { 
        if(!stopped) 
        _; 
    }

    // Contract constructor
    constructor() public {
        owner = msg.sender;
    }

    // Toggle contract running state
    function toggleContractActive() public verifyOwner() {
        stopped = !stopped;
    }
    /**
      * @dev Get contract owner
      * @return _owner Contract owner
      */
    function getOwner() public view returns (address _owner) {
        return owner;
    }

    /**
      * @dev Transfer contract to new owner
      * @param _newOwner New contract owner
      */
    function transferOwner(address _newOwner) public verifyOwner {
        require(_newOwner != address(0), "New owner address is null");
        address oldOwner = owner;
        owner = _newOwner;
        emit LogTransferOwner(oldOwner, owner);
    }

    /**
      * @dev Withdraw contract balance
      * @param _amount amount to withdraw
      */
    function withdraw(uint _amount) public verifyOwner {
        require(_amount <= address(this).balance, "Do not have enough balance");
        msg.sender.transfer(_amount);
        emit LogWithdraw(owner, _amount);
    }

    /** @dev Get account user's IPFS root hash for alarms
      * @param _udid iOS device udid
      * @return _sender, _value The Hash structure values
      */
    function getHash(string memory _udid) public view returns (address _sender, string memory _value) {
        return (hashes[_udid].sender, hashes[_udid].value);
    }

    /** @dev Update account user's IPFS root hash for alarms
      * @param _udid iOS device udid
      * @param _value The IPFS hash value
      */
    function saveHash(string memory _udid, string memory _value) public payable suspend {
        require(msg.value >= fee, "Not paid enough service fee");
        hashes[_udid].sender = msg.sender;
        hashes[_udid].value = _value;
        emit LogSaveHash(hashes[_udid].sender, hashes[_udid].value);
    }

    // Fallback function
    function() external {
        revert("Invalid function");
    }
}
