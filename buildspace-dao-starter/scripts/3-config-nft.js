import sdk from "./1-initialize-sdk.js";
import { readFileSync } from 'fs';

const bundleDrop = sdk.getBundleDropModule(
    "0x4066473a99fF188903d9CDd19Bf06Cb75Cf4f91b",
);

(async () => {
    try {
        await bundleDrop.createBatch([
            {
                name: "Baby bump",
                description: "This NFT will give you access to BirthingDenDAO!",
                image: readFileSync("scripts/assets/babybump.png"),
            },
        ]);
        console.log('✅ Successfully created a new NFT in the drop!');
    } catch (error) {
        console.log('failed to create the new NFT', error);
    }
}) ()