// Подключаемся к контракту
const contractAddress = "0xdA69Bf15D40E5d3edCb3600f25bd21060C699F9E"; // Замените вашим контрактом
// Указываем ABI (Application Binary Interface) контракта

const abi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "bet",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "playerChoice",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "result",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "GameResult",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_choice",
				"type": "string"
			}
		],
		"name": "playGame",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "betAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "rewardMultiplier",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Подключаемся к web3 провайдеру (метамаск)
const provider = new ethers.providers.Web3Provider(window.ethereum, 97);
// const provider = new ethers.BrowserProvider(window.ethereum);
let signer;
let contract;
// Запрашиваем аккаунты пользователя и подключаемся к первому аккаунту
provider.send("eth_requestAccounts", []).then(() => {
    provider.listAccounts().then((accounts) => {
        signer = provider.getSigner(accounts[0]);
        // Создаем объект контракта
        contract = new ethers.Contract(contractAddress, abi, signer);
        console.log(contract);
    });
});

// Play game function
// async function playGame() {
//     const choice = document.getElementById("choice").value;

//     // Validate user choice
//     if (choice !== "Rock" && choice !== "Paper" && choice !== "Scissors") {
//         alert("Please select Rock, Paper, or Scissors.");
//         return;
//     }

//     try {
//         const betAmount = ethers.utils.parseEther("0.0001"); // 0.0001 tBNB
//         console.log("Bet amount: ", betAmount);

//         // Call the playGame function
//         const tx = await contract.playGame(choice, {
//             value: betAmount,
//             gasLimit: 3000000 // Adjust the gas limit as needed
//         });

//         await tx.wait(); // Wait for the transaction to be confirmed

//         // Get the result of the game from the GameResult event
//         const event = await contract.queryFilter("GameResult", tx.blockNumber, tx.blockNumber);
//         const gameResult = event[0].args;

//         const resultMessage = `
//             You played: ${gameResult.playerChoice}.
//             Result: ${gameResult.result}.
//             Payout: ${ethers.utils.formatEther(gameResult.payout)} ETH.
//         `;
//         document.getElementById("result").innerText = resultMessage;

//     } catch (error) {
//         console.error("Error during transaction:", error);
//         alert("Transaction failed: Check the console for details.");
//     }
// }
async function playGame() {
    const choice = document.getElementById("choice").value;

    if (!["Rock", "Paper", "Scissors"].includes(choice)) {
        alert("Invalid choice. Please select Rock, Paper, or Scissors.");
        return;
    }

    try {
        const tx = await contract.playGame(choice, {
            value: ethers.utils.parseEther("0.0001"),
            gasLimit: 3000000 // Adjust as needed
        });
        await tx.wait();

        // Narrow down event query to the transaction's block
        const event = await contract.queryFilter(
            "GameResult",
            tx.blockNumber,
            tx.blockNumber
        );
        const gameResult = event[0].args;

        const resultMessage = `
            You played: ${gameResult.playerChoice}.
            Result: ${gameResult.result}.
            Payout: ${ethers.utils.formatEther(gameResult.payout)} ETH.
        `;
        document.getElementById("result").innerText = resultMessage;

        // Add game to history
        gameHistory.push({
            player: gameResult.player,
            choice: gameResult.playerChoice,
            result: gameResult.result,
            payout: ethers.utils.formatEther(gameResult.payout)
        });

        displayGameHistory();
    } catch (error) {
        if (error.code === -32603 && error.data?.code === -32005) {
            alert("Rate limit exceeded. Please wait and try again later.");
        } else {
            console.error("Error during transaction:", error);
            alert("Transaction failed. Check the console for details.");
        }
    }
}

// Fetch and display the contract's balance
async function getContractBalance() {
    const balance = await contract.getContractBalance();
    const formattedBalance = ethers.utils.formatEther(balance);
    document.getElementById("contract-balance").innerText = formattedBalance;
}

function displayGameHistory() {
    const historyContainer = document.getElementById("game-history");
    historyContainer.innerHTML = ""; // Clear existing history

    if (gameHistory.length === 0) {
        historyContainer.innerHTML = "<p>No games played yet.</p>";
        return;
    }

    gameHistory.forEach((game, index) => {
        const gameElement = document.createElement("div");
        gameElement.innerHTML = `
            <p>Game #${index + 1}:</p>
            <ul>
                <li>Player: ${game.player}</li>
                <li>Choice: ${game.choice}</li>
                <li>Result: ${game.result}</li>
                <li>Payout: ${game.payout} ETH</li>
            </ul>
        `;
        historyContainer.appendChild(gameElement);
    });
}
