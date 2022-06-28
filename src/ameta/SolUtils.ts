import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { MintLayout, Token, TOKEN_PROGRAM_ID, AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  Transaction,
} from '@solana/web3.js';
import fs from 'fs'
import { connection, getProgram, openBox } from './SolAMeta';
import { sign } from 'tweetnacl';
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Connection, programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;
import { deserializeUnchecked } from 'borsh';
import { ErrorCode } from '../config/ErrorCodeConfig';
import { assign } from '@mikro-orm/core';
import { PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
  new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const PREFIX = 'a_meta';


export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export const AMETA_TOKEN = new web3.PublicKey('9ezfMjPwsPfRtRi41PER8xFpZDQCm2ccTj488uqGguT6');
export const OWNER_TOKEN_ACCOUNT = new web3.PublicKey('BfvHGfacbqHe58NSD8mJQB9ZNqPb7ZG7gWHNRSAzwefh');

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
};


export interface AMetaData {
  symbol: string;
  price: anchor.BN;
}

export const getAMeta = async () => {
  let aMetaProgram = await getProgram();
  return await PublicKey.findProgramAddress(
    [Buffer.from(PREFIX)],
    aMetaProgram.programId
  )

}

export const MY_WALLET: Keypair = web3.Keypair.fromSecretKey(
  new Uint8Array(
    JSON.parse(fs.readFileSync(__dirname + '/ametakeypair.json').toString())
  )
)

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey,
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

export const getMetadata = async (
  mint: anchor.web3.PublicKey,
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const isValidMessage = (msg: string, walletAddress: string, sig: string) => {
  const message = new TextEncoder().encode(msg);
  const sigDecode = bs58.decode(sig);
  const wallet = new PublicKey(walletAddress);
  // console.log(message, new Uint8Array(sig), wallet);
  let verified = sign.detached.verify(message, new Uint8Array(sigDecode), wallet.toBytes())
  return verified;
}

export const getMetadataNFT = async (address: string) => {
  const metadataPDA = await Metadata.getPDA(new PublicKey(address));
  const tokenMetadata = await Metadata.load(connection, metadataPDA);
  let metadata: programs.metadata.MetadataData = tokenMetadata.data;
  console.log(metadata);
}

export const validateBoxAddress = async (boxAddress: string, walletAddress: string) => {
  try {
    const metadataPDA = await Metadata.getPDA(new PublicKey(boxAddress));
    const tokenMetadata = await Metadata.load(connection, metadataPDA);
    console.log(tokenMetadata);
    let metadata: programs.metadata.MetadataData = tokenMetadata.data;
    if (!metadata) {
      throw new Error(ErrorCode.InvalidNFTAddress)
    }
    if (metadata.updateAuthority != walletAddress) throw new Error(ErrorCode.WalletNotOwnBox);
  } catch (err) {
    console.log(err);
    throw new Error(ErrorCode.InvalidNFTAddress)
  }
}

export const findAssociatedTokenAddress = async (
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> => {
  return (await PublicKey.findProgramAddress(
    [
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  ))[0];
}

export const initializeMint = async (
  decimals: number,
  token: web3.Keypair,
) => {
  const program = await getProgram();
  let create_mint_tx = new Transaction().add(
    // create mint account
    SystemProgram.createAccount({
      fromPubkey: program.provider.wallet.publicKey,
      newAccountPubkey: token.publicKey,
      space: MintLayout.span,
      lamports: await Token.getMinBalanceRentForExemptMint(program.provider.connection),
      programId: TOKEN_PROGRAM_ID,
    }),
    // init mint account
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      token.publicKey, // mint pubkey
      decimals, // decimals
      program.provider.wallet.publicKey, // mint authority
      program.provider.wallet.publicKey // freeze authority (if you don't need it, you can set `null`)
    )
  );

  await program.provider.send(create_mint_tx, [token]);
}

export const createAccount = async (keypair: Keypair) => {
  const program = await getProgram();
  SystemProgram.createAccount({
    fromPubkey: program.provider.wallet.publicKey,
    newAccountPubkey: keypair.publicKey,
    space: AccountLayout.span,
    lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
    programId: TOKEN_PROGRAM_ID,
  });
  // create ata
  let ata = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID, // connection
    TOKEN_PROGRAM_ID,
    AMETA_TOKEN, // mint
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    OWNER_TOKEN_ACCOUNT,
    keypair.publicKey
  );
  console.log("ATA " + new PublicKey(ata.data).toBase58());
  //mint ameta to user
  let tx = new Transaction().add(Token.createMintToInstruction(
    PROGRAM_ID,
    AMETA_TOKEN,
    keypair.publicKey,
    OWNER_TOKEN_ACCOUNT,
    [],
    1e11
  ))
  let trx = await connection.sendTransaction(tx,[]);
  console.log("transactionId " + trx);
}