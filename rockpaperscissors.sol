// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract RockPaperScissors {


    address public owner;
    uint public betAmount = 100000000000000 wei;
    uint public rewardMultiplier = 2;  


    string[3] choices = ["Rock", "Paper", "Scissors"];  


    constructor() {
        owner = msg.sender;
    }


    modifier onlyOwner(){
        require(msg.sender == owner, "Only the contract owner can place bets");
        _;
    }


    event GameResult(address indexed player, uint256 bet, string playerChoice, string result, uint256 payout);


    function playGame(string memory _choice) public payable{
        require(msg.value >= betAmount, "Bet amount must be at least equal to 0.0001 tBNB");
        require(msg.value <= address(this).balance, "Insufficient balance in contract");


        uint payout = 0;


        uint playerChoiceIndex = getChoiceIndex(_choice);
        require(playerChoiceIndex < 3, "Invalid choice. Must be Rock, Paper), or Scissors");


        uint resultIndex = getResult();
        string memory resultChoice = choices[resultIndex];


        if (((playerChoiceIndex -1 + 3)%3) == resultIndex) {
            payout = msg.value * rewardMultiplier;
            payable(msg.sender).transfer(payout);
        }


        emit GameResult(msg.sender, msg.value, _choice, resultChoice, payout);
    }


    function getChoiceIndex(string memory _choice) internal pure returns (uint) {
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("Rock"))) {
            return 0;
        } else if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("Paper"))) {
            return 1;
        } else if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("Scissors"))) {
            return 2;
        } else {
            return 3;
        }
    }


    function getResult() internal view onlyOwner returns (uint) {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        return random % 3;  
    }


    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }


    receive() external payable { }
}
