import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction, TransactionInstructionCtorFields } from '@solana/web3.js';
import {
  Program, Provider, web3, BN, Wallet
} from '@project-serum/anchor';
// import idl from './ameta.json'
import ametaIdl from './ameta.json';
import { createAssociatedTokenAccountInstruction, getAtaForMint, getMetadata, getAMeta, MY_WALLET, AMetaData, TOKEN_METADATA_PROGRAM_ID, findAssociatedTokenAddress } from './SolUtils';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import OuterNFT from './OuterNFT';
import BoxNFT from './BoxNFT';
import { Ameta } from './ameta';
import FishingRodNFT from './FishingRodNFT';
import { ErrorCode } from '../config/ErrorCodeConfig';
import { closeDb, collection } from '../commons/mongo';
import { User } from '../models/User';

const network = clusterApiUrl("devnet");

export const preflightCommitment: web3.ConfirmOptions = {
  preflightCommitment: 'confirmed'
};

export const connection: Connection = new Connection(network, preflightCommitment.preflightCommitment);

export const programID = new PublicKey(ametaIdl.metadata.address);

export const getProvider = (): Provider => {

  const provider: Provider = new Provider(connection, new NodeWallet(MY_WALLET), preflightCommitment);
  return provider;
}

export const getProgram = (): Program<Ameta> => {
  const provider = getProvider();
  //@ts-ignore
  return new Program<Ameta>(ametaIdl, programID, provider);
}

export const initAMeta = async () => {
  const program = await getProgram();
  const [aMetaPDA, bump] = await getAMeta();
  let aMetaData: AMetaData = {
    price: new BN(12),
    symbol: 'AMC',
  };
  // await program.rpc.initializeGame(aMetaData, {
  //   accounts: {
  //     aMeta: aMetaPDA,
  //     authority: MY_WALLET.publicKey,
  //     systemProgram: SystemProgram.programId,
  //   },
  //   signers: [MY_WALLET],

  // })
  console.log("sdsdsadaasd==========", await program.account.aMeta.fetch(aMetaPDA));
}

export const buyBox = async () => {
  const program = await getProgram();
  const [aMetaPDA, bump] = await getAMeta();
  const buyerWallet = new web3.PublicKey('J6wxcpJYGLeD192VXjYRejooB7kEGbZMq8jdGLcY3fmR');
  const boxNft = Keypair.generate();
  const ametaToken = new web3.PublicKey('9ezfMjPwsPfRtRi41PER8xFpZDQCm2ccTj488uqGguT6');
  const buyerTokenAccount = await findAssociatedTokenAddress(buyerWallet, ametaToken);
   const ownerTokenAccount = new web3.PublicKey('BfvHGfacbqHe58NSD8mJQB9ZNqPb7ZG7gWHNRSAzwefh');
  // const ownerTokenAccount = new web3.PublicKey('BfvHGfacbqHe58NSD8mJQB9ZNqPb7ZG7gWHNRSAzwefh');
  const boxVault = await findAssociatedTokenAddress(buyerWallet, boxNft.publicKey);
  const metadataAddress = await getMetadata(boxNft.publicKey);
  
  console.log("buyerTokenAccount balance: ", (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount)).value.uiAmount);

  await program.rpc.buyBox(bump, 'BOX1', 'STARTER_BOX', {
    accounts: {
      aMeta: aMetaPDA,
      payer: buyerWallet,
      boxMint: boxNft.publicKey,
      // aMetaToken: aMetaToken.publicKey,
      // mintAuthority: payer.publicKey,
      buyerTokenAccount: buyerTokenAccount,
      ownerTokenAccount: ownerTokenAccount,
      vault: boxVault,
      metadata: metadataAddress,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
    }
    , signers: [boxNft]
  })
}

export const openBox = async (payer: string, boxAddress: string) => {
  try {
    let fishingRod = new FishingRodNFT();
    let fishingRodTokenMetadata = await fishingRod.generate(payer);
    let fishingRodUri = await fishingRod.upload();
    let fishingRodMint = Keypair.generate();
    const [aMetaPDA, bump] = await getAMeta();
    const program = await getProgram();
    const buyerWallet = new web3.PublicKey(payer);
    const boxVault = await findAssociatedTokenAddress(buyerWallet, new web3.PublicKey(boxAddress));
    let fishingRodVault = await findAssociatedTokenAddress(buyerWallet, fishingRodMint.publicKey);
    const metadataAddress = await getMetadata(fishingRodMint.publicKey);
    let sig = await program.rpc.openBox(bump, fishingRodUri, fishingRodTokenMetadata.name, {
      accounts: {
        aMeta: aMetaPDA,
        user: buyerWallet,
        boxMint: new web3.PublicKey(boxAddress),
        boxTokenAccount: boxVault,
        mint: fishingRodMint.publicKey,
        vault: fishingRodVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [
        fishingRodMint,
        // buyerWallet
      ]
    })
    const mkt_user_collection = await collection('user');
    const mkt_item_collection = await collection('item');
    const user: User = await mkt_user_collection.findOne<User>({ walletAddress: payer });
    const newFishingRod = await mkt_item_collection.insertOne({
      owner: user._id.toString(),
      itemType: 3,
      name: 'FISHING_ROD',
      description: 'Fishing-Rod, relax with fishing',
    })
    closeDb();


    return sig;
  } catch (err) {
    console.log(err);
    throw new Error(ErrorCode.TransactionFailed);
  }
  return null;
}

