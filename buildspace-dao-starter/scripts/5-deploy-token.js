import sdk from "./1-initialize-sdk.js";

// in order to deploy the new contract we need our old friend the app module again
const app = sdk.getAppModule("0x8D6cB196a3f192553b02F30C4EA20B540eAd9D05");

(async () => {
    try {
        // deploy a standard ERC-20 contract
        const tokenModule = await app.deployTokenModule({
            // what's your token's name? Ex. "Ethereun"
            name: "BirthingDenDAO Governance Token",
            // what's your token's symbol? ex. ETH
            symbol: "BIRTH",
        });
        console.log(
            "✅ Successfully deployed token module, address:",
            tokenModule.address,
        );
    } catch (error) {
        console.error("failed to deploy token module", error);
    }
}) ();