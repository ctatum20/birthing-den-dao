import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// voting contract
const voteModule = sdk.getVoteModule(
    "0xa0362C4bE1f27e33D87411100cDdAE5CF0Eea769",
);

//erc-20 contract
const tokenModule = sdk.getTokenModule(
    "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D",
);

(async () => {
    try {
        const amount = 420_000;
        // create proposal to mint 420,000 new token to the treasury
        await voteModule.propose(
            "Should the DAO mint an additional " + amount + " tokens into the treasury?",
            [
                {
                    // Out nativeToken is ETH. NativeTokenValue  is the amount of ETH we want
                    // to send in this proposal. In this case, we're sending 0 ETH.
                    // We're just minting new tokens to the treasury. So, set to 0.
                    nativeTokenValue: 0, // this gives us the option to send BIRTHtoken and if we want to send ETH or whatever BUT we will have to have those other tokens in the treasury to do so
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        // We're doing a mint! And, we're minting to the voteModule, which is 
                        // acting as our treasury
                        "mint",
                        [
                            voteModule.address,
                            ethers.utils.parseUnits(amount.toString(), 18),
                        ]
                    ),

                    // our token module that actually executes the mint
                    toAddress: tokenModule.address,
                },
            ]
        );

        console.log("✅Successfully created proposal to mint tokens");
    } catch (error) {
        console.error("failed to create first proposal", error);
        process.exit(1);
    }

    try {
        const amount = 6_900;
        // create proposal to transfer ourselves 6,900 tokens for being awesome
        await voteModule.propose(
            "Should the DAO transfer " +
            process.env.WALLET_ADDRESS + " for being awesome?!",
            [
                {
                    // again, we're sending ourselves 0 ETH. Just sending our own token
                    nativeTokenValue: 0,
                    transactionData: tokenModule.contract.interface.encodeFunctionData(
                        //we're doing a transfer from the treasury to our wallet
                        "transfer",
                        [
                            process.env.WALLET_ADDRESS,
                            ethers.utils.parseUnits(amount.toString(), 18),
                        ]
                    ),

                    toAddress: tokenModule.address,
                },
            ]
        );

        console.log(
            "✅Successfully created proposal to reward ourselves from the treasury, let's hope people vote for it!"
        );
    } catch (error) {
        console.error("failed to create second proposal", error);
    }
}) ();