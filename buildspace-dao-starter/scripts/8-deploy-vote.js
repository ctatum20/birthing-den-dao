import sdk from "./1-initialize-sdk.js";

// grab the app module address
const appModule = sdk.getAppModule(
    "0x8D6cB196a3f192553b02F30C4EA20B540eAd9D05",
);

(async () => {
    try {
        const voteModule = await appModule.deployVoteModule({
            // give your governance contract a name
            name: "BirthingDenDAO's Epic Proposals",

            // this is the location of our governance token, our ERC-20 contract!
            votingTokenAddress: "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D",

            // after a proposal is created, when can members start voting?
            // for now, we set this to immediately
            proposalStartWaitTimeInSeconds: 0,

            //How long do members have to vote on a proposal when it's created?
            // here, we set it to 24 hours (86400 seconds)
            proposalVotingTimeInSeconds: 24 * 60 * 60,

            votingQuorumFraction: 0, //this being 0 will allow anyone to make a proposal and if time runs out, their proposal goes through. to avoid this, "in order for a proposal to pass,a minimum  x % of token must be used in the vote"

            // what's the minimum # of tokens a user needs to be allowed to create a proposal? 
            // if you set it to 0,no tokens are required
            minimumNumberOfTokensNeededToPropose: "0",
        });

        console.log(
            "✅ Successfully deployed vote module, address:",
            voteModule.address,
        );
    } catch (error) {
        console.error('failed to deploy vote module', error);
    }
}) ();