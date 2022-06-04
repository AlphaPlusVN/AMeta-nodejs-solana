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

export const buyBox = async (payer: string) => {
  // const [aMetaPDA, bump] = await getAMeta();
  // let boxNft = new BoxNFT();
  // let metadata = await boxNft.generate(payer);
  // let url = await boxNft.upload();
  // const boxMint = Keypair.generate();
  // const program = await getProgram();
  // const convertPayer = new web3.PublicKey(payer);
  // let vault = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, boxMint.publicKey, convertPayer);
  // const metadataAddress = await getMetadata(boxMint.publicKey);
  // let sig = await program.rpc.buyBox(bump, metadata.name, 'BOX', url, {
  //   accounts: {
  //     aMeta: aMetaPDA,
  //     payer: convertPayer,
  //     mint: boxMint.publicKey,
  //     mintAuthority: convertPayer,
  //     vault: vault,
  //     metadata: metadataAddress,
  //     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //     rent: web3.SYSVAR_RENT_PUBKEY,
  //     systemProgram: web3.SystemProgram.programId,
  //   }, signers: [boxMint]
  // })
  // return sig;
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
    return sig;
  } catch (err) {
    console.log(err);
    throw new Error(ErrorCode.TransactionFailed);
  }
  return null;
}

