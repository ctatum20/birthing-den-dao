import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
    "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D"
);

(async () => {
    try {
        // log the current roles
        console.log(
            "😌 Roles that exist right now:",
            await tokenModule.getAllRoleMembers()
        );

        // revoke all the superpowers your wallet had over ERC-30 contract
        await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
        console.log(
            "🎉 Roles after revoking ourselves",
            await tokenModule.getAllRoleMembers()
        );
        console.log("✅ Successfully revoked our superpowers from ERC-20 contract");
    } catch (error) {
        console.error("failed to revoke ourselves from the DAO treasury", error);
    }
}) ();