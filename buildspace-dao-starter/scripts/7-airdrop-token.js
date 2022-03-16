import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// this is the address to our ERC-115 membership NFT contract
const bundleDropModule = sdk.getBundleDropModule(
    "0x4066473a99fF188903d9CDd19Bf06Cb75Cf4f91b",
);

// this is the address to our ERC-20 token contract
const tokenModule = sdk.getTokenModule(
    "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D",
);

(async () => {
    try {
        // grab all the addresses of who own our membership NFT, which has
        // a tokenID of 0
        const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

        if (walletAddresses.length === 0) {
            console.log(
                "No NFTs have been claimed yet, maybe get some friends to claim your free NFTs!",
            );
            process.exit(0);
    }
    

    // loop thorugh the array of addresses
    const airdropTargets = walletAddresses.map((address) => {
        // pick a random # between 1000 and 10000
        const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
        console.log("✅  Going to airdrop", randomAmount, "tokens to", address);
    
    // set up the target
    const airdropTarget = {
        address,
        // remember, we need 18 decimal places!
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
    };

    return airdropTarget;
});

// call tranferBatch on all our airdrop targets
console.log("🌈 Searching airdrop...")
await tokenModule.transferBatch(airdropTargets);
console.log("✅ Successfully airdropped tokens to all the holders of the NFT!");
} catch (error) {
    console.error("Failed to airdrop tokens", error);
}
}) ();