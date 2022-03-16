import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
    "0x4066473a99fF188903d9CDd19Bf06Cb75Cf4f91b",
);

(async () => {
    try {
        const claimConditionFactory = bundleDrop.getClaimConditionFactory();
        // specify conditions
        claimConditionFactory.newClaimPhase({
            startTime: new Date(),
            maxQuantity: 10_000,
            maxQuantityPerTransaction: 1,
        });

        await bundleDrop.setClaimCondition(0, claimConditionFactory);
        console.log("✅ Successfully set claim condition on bundle drop:", bundleDrop.address);
      } catch (error) {
        console.error("Failed to set claim condition", error);
    }
}) ()