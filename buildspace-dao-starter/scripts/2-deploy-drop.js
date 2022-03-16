import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';
import { readFileSync } from 'fs';

const app = sdk.getAppModule('0x8D6cB196a3f192553b02F30C4EA20B540eAd9D05');

(async () => {
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            // the collection's name, ex. CryptoPunks
            name: "BirthingDenDAO Membership",
            // a description for the collection
            description: "A DAO for pregnant and postpartum mothers",
            // the image for the collection that will show up on OpenSea
            image: readFileSync("scripts/assets/babybump.png"),
            // we need to pass in the address of the person who will be receiving the proceeds from sales of nfts in the module
            // we're planning on not charging people for the drop, we we'll pass in the 0x0 address
            // you can set this to your own wallet address if you want to charge for the drop
            primarySaleRecipientAddress: ethers.constants.AddressZero,
        });

        console.log(
            "✅ Successfully deployed bundleDrop module, address:",
            bundleDropModule.address,
        );
        console.log(
            "✅  bundleDrop metadata:",
            await bundleDropModule.getMetadata(),
        );
    } catch (error) {
        console.log('failed to deploy bundleDrop module', error);
    }
}) ()