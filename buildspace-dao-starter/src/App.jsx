import { UnsupportedChainIdError } from "web3-react/core";
import { useEffect, useState, useMemo } from "react";
// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";

// we instantiate the sdk on RInkeby
const sdk = new ThirdwebSDK("rinkeby");

// we can grab a referenceto our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x4066473a99fF188903d9CDd19Bf06Cb75Cf4f91b",
);

const tokenModule = sdk.getTokenModule( //this is needed here so we can interact with erc-1155(addresses) and erc-20 (#of tokens) contract
  "0xfF2B120EA84a3aD9C4d1491C2d08596AcC36e96D",
);

const voteModule = sdk.getVoteModule(
  "0xa0362C4bE1f27e33D87411100cDdAE5CF0Eea769"
)

const App = () => {
  // use the connectWallet hook thirdweb gives us
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋🏾 Address:", address)

  // the signer is required to sign transactionss on the blockchain
  // without it we can only read data, not write
  const signer = provider ? provider.getSigner() :  undefined;

  // state variable for us to know if user has our NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);

  //hold the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  //the array holding all of our member addresses
  const [memberAddresses, setMemberAddresses] = useState ([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (error instanceof UnsupportedChainIdError ) {  // this message comes up if user isn't using the rinkeby network
    return (
      <div className="unsupported-network">
        <h2>Please connect ro Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  // retrieve all our existing proposals from the contract
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }
    // a simple call to voteModule.getAll() to grab the proposals
    try {
      const proposals = await voteModule.getAll();
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    } catch (error) {
      console.error("failed to get proposals", error);
    }
  }, [hasClaimedNFT]);

  // we also need to check if the user already voted
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above 
    // then we can't check if the iser voted yet!
    if (!proposals.length) {
      return;
    } 

    // check if the user has already voted on the first proposal
    try {
      const hasVoted = await voteModule.hasVoted.apply(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if(hasVoted) {
        console.log("😓User has already voted");
      } else {
        console.log("😅 User has not voted yet");
      }
    } catch (error) {
      console.error("failed to check if wallet has voted", error);
    }
  }, [hasClaimedNFT, proposals, address]);

  // fancy function to shorten someones wallet address, no need to show the whole thing
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length -4);
  };

  // this useEffect grabs all the addresses of our members holding our NFT
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

     // just like we did in -7-airdrop file! grab the users who hold our NFT with tokenID 0
     try {
       const memberAddresses = await bundleDropModule.getAllClaimerAddresses("0");
       setMemberAddresses(memberAddresses);
       console.log("🚀 Members Addresses", memberAddresses)
     } catch (error) {
       console.error("failed to get member list", error);
     }
  }, [hasClaimedNFT]);

  // this useEffect grabs the # of token each memeber holds
  useEffect(async () => {
    if(!hasClaimedNFT) {
      return;
    }

    // grab all the balances
    try {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("💰 Amounts", amounts);
    } catch (error) {
      console.error("failed to get token amounts", error);
    }
  }, [hasClaimedNFT]);

  // now we can combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        memberTokenAmount: ethers.utils.formatUnits(
          // if the address isn;t in memberTokenAmounts, it means they don't
          // hold any of our token
          memberTokenAmounts [address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  // another useEffect!
  useEffect(() => {
    // we pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

    useEffect(async () => {
    // if they don’t have a connected wallet, exit!
    if (!address) {
      return;
    }

    // check if the user has the NFT by using bundleDropModule.balanceOf
    const balance = await bundleDropModule.balanceOf(address, "0"); //‘0’ is he

    try {
      // if balance is greater than 0, they have our NFT!
      if(balance.gt(0)) {
        setHasClaimedNFT(true);
        console.log("🌟 this user has a memebership NFT!");
      } else {
        setHasClaimedNFT(false);
        console.log("😅 this user does not have a membership NFT.")
      }
    } catch (error) {
      setHasClaimedNFT(false)
      console.error("failed to nft balance", error);
    }
  }, [address]); 

  // this is the case where the user hasn’t connected their wallet
  // to your web app. Let them call connectWallet
  if (!address) {
  return (
    <div className="landing">
      <h1>Welcome to BirthingDenDAO</h1>
      <button onClick={() => connectWallet("injected")} className="btn-warrior">
        Connect Your Wallet
      </button>
    </div>
  );
}


if (hasClaimedNFT) { // if member has NFT this is the DAO Dashboard 
  return (
   <div className="member-page">
        <h1>🤰🏾 BirthingDenDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free BirthingDenDAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => {
          setIsClaiming(true);
          // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
          bundleDropModule
            .claim("0", 1)
            .catch((err) => {
              console.error("failed to claim", err);
              setIsClaiming(false);
            })
            .finally(() => {
              // Stop loading state.
              setIsClaiming(false);
              // Set claim state.
              setHasClaimedNFT(true);
              // Show user their fancy new NFT!
              console.log(
                `Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
              );
            });
        }}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;