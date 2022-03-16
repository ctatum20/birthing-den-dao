import { VoteModule } from "@3rdweb/sdk";
import { ethers} from "ethers";
import sdk from "./1-initialize-sdk.js";

//this is the governance contract
const voteModule = sdk.getVoteModule(
    "0xa0362C4bE1f27e33D87411100cDdAE5CF0Eea769",
);

//erc-20 contract
const tokenModule = sdk.getTokenModule(
    "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D",
);

(async () => {
    try {
        // give treasury the power to mint additional token if needed
        await tokenModule.grantRole("minter", voteModule.address);
        console.log(
            "Successfullly gave vote module permissions to act on token module"
        );
    } catch (error) {
        console.error(
            "failed to grant vote module permissions on token module", error
        );
        process.exit(1);
    }

    try {
        // grab our wallet's token balance, remember == we hold basically the entire supply right now
        const ownedTokenBalance = await tokenModule.balanceOf(
            // the wallet address is stored in your env file 
            process.env.WALLET_ADDRESS
        );

        // grab 90% of supply that we hold
        const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
        const percent90 = ownedAmount.div(100).mul(90);

        // transfer 90% of supply to voting contract
        await tokenModule.transfer(
            voteModule.address,
            percent90
        );
        console.log("✅ Successfully transferred tokens to vote module");
    } catch (error) {
        console.error("failed to transfer tokens to vote module", error)
    }
}) ();