import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction, TransactionInstructionCtorFields } from '@solana/web3.js';
import {
  Program, Provider, web3, BN, Wallet
} from '@project-serum/anchor';
import idl from './outer_space.json'
import { OuterSpace } from './outer_space';
import { createAssociatedTokenAccountInstruction, getAtaForMint, getMetadata, getOuterSpace, MY_WALLET, OuterSpaceData, TOKEN_METADATA_PROGRAM_ID } from './SolUtils';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';
import { ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import OuterNFT from './OuterNFT';
import BoxNFT from './BoxNFT';

const network = clusterApiUrl("devnet");

export const preflightCommitment: web3.ConfirmOptions = {
  preflightCommitment: 'confirmed'
};

export const connection: Connection = new Connection(network, preflightCommitment.preflightCommitment);

export const programID = new PublicKey(idl.metadata.address);

export const getProvider = (): Provider => {

  const provider: Provider = new Provider(connection, new NodeWallet(MY_WALLET), preflightCommitment);
  return provider;
}

export const getProgram = (): Program<any> => {
  const provider = getProvider();
  return new Program<any>(idl, programID, provider);
}

export const initOuterSpace = async () => {
  const program = await getProgram();
  const [outerSpacePDA, bump] = await getOuterSpace();
  let outerSpaceData: OuterSpaceData = {
    price: new BN(12),
    symbol: 'OPG',
  };
  await program.rpc.initializeOuterSpace(outerSpaceData, {
    accounts: {
      outerSpace: outerSpacePDA,
      authority: MY_WALLET.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [MY_WALLET],

  })
  console.log("sdsdsadaasd==========", await program.account.outerSpace.fetch(outerSpacePDA));
}

export const buyBox = async (payer: string) => {
  let boxNft = new BoxNFT();
  let metadata = await boxNft.generate(payer);
  let url = await boxNft.upload();
  const boxMint = Keypair.generate();
  let boxInstructions = await createNFTInstructionArray(
    boxMint,
    new web3.PublicKey(payer),
    metadata.name,
    'BOX',
    url
  )
  let buy_box_tx = new Transaction().add(
    ...boxInstructions,
    
  )
  let provider: Provider = await getProvider();
  return await provider.send(buy_box_tx, [boxMint]);
}

export const openBox = async (payer) => {
  let outer1 = new OuterNFT();
  let outer1TokenMetadata = await outer1.generate(payer);
  let outer1Uri = await outer1.upload();
  let outer1Mint = Keypair.generate();
  let outer1Instructions = await createNFTInstructionArray(
    outer1Mint,
    new web3.PublicKey(payer),
    outer1TokenMetadata.name,
    'OUTER',
    outer1Uri);

  let outer2 = new OuterNFT();
  let outer2TokenMetadata = await outer2.generate(payer);
  let outer2Uri = await outer2.upload();
  let outer2Mint = Keypair.generate();
  let outer2Instructions = await createNFTInstructionArray(
    outer2Mint,
    new web3.PublicKey(payer),
    outer2TokenMetadata.name,
    'OUTER',
    outer2Uri);

  let outer3 = new OuterNFT();
  let outer3TokenMetadata = await outer3.generate(payer);
  let outer3Uri = await outer3.upload();
  let outer3Mint = Keypair.generate();
  let outer3Instructions = await createNFTInstructionArray(
    outer3Mint,
    new web3.PublicKey(payer),
    outer3TokenMetadata.name,
    'OUTER',
    outer3Uri);

  let open_box_tx = new Transaction().add(
    ...outer1Instructions,
    ...outer2Instructions,
    ...outer3Instructions
  )

  let provider: Provider = await getProvider();
  return await provider.send(open_box_tx, [outer1Mint, outer2Mint, outer3Mint]);
  // return await provider.send(open_box_tx, [outer1Mint]);
}


export const createNFTInstructionArray = async (mint: Keypair, payer: web3.PublicKey, name, symbol: string, uri: string): Promise<Array<
  Transaction | TransactionInstruction | TransactionInstructionCtorFields
>> => {
  // let mint = Keypair.generate();
  const [outerSpacePDA, bump] = await getOuterSpace();
  const metadataAddress = await getMetadata(mint.publicKey);
  const userTokenAccountAddress = (
    await getAtaForMint(mint.publicKey, payer)
  )[0];
  const program = await getProgram();
  let vault = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, program.provider.wallet.publicKey);

  let instructionArray = new Array(

    await program.instruction.openBox(bump, name, symbol, uri, {
      accounts: {
        outerSpace: outerSpacePDA,
        payer: payer,
        mint: mint.publicKey,
        mintAuthority: payer,
        vault: vault,
        metadata: metadataAddress,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
    })
  );

  return instructionArray;
}