import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// importing and configuring our .env file that we use to securely store our environment valiables
import dotenv from 'dotenv';
dotenv.config();

// some quick checks to make sure our .env is working
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
    console.log("🛑 Private key not found")
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == "") {
    console.log("🛑 Alchemy API URL not found")
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
    console.log("🛑 Wallet Address not found")
}

const sdk = new ThirdwebSDK(
    new ethers.Wallet(
        // Your wallet private key. ALWAYS KEEP THIS PRIVATE! DON'T SHARE WITH ANYONE
        // add to .env file and do not commit that file to gitHub
        process.env.PRIVATE_KEY,
        // RPC URL, we'll use our Alchemy API URL from our .env file
        ethers.getDefaultProvider(process.env.ALCHEMY_API_URL),
    ),
);

(async () => { // this is to make sure we can retrieve the project we made using thirdweb's web app!
    try {
        const apps = await sdk.getApps();
        console.log('Your app address is:', apps[0].address);
    } catch (error) {
        console.error('Failed to get apps from the sdk', error);
        process.exit(1);
    } 
}) ()

// we are exporting the initialized thirdweb SDK so we can use it in ourother scripts
export default sdk;