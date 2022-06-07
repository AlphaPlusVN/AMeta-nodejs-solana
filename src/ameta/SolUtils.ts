import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
} from '@solana/web3.js';
import fs from 'fs'
import { connection, getProgram } from './SolAMeta';
import { sign } from 'tweetnacl';
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Connection, programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;
import { deserializeUnchecked } from 'borsh';
import { ErrorCode } from '../config/ErrorCodeConfig';
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
  new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const PREFIX = 'a_meta';


export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

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
    if(!metadata){
      throw new Error(ErrorCode.InvalidNFTAddress)
    }
    if(metadata.updateAuthority != walletAddress) throw new Error(ErrorCode.WalletNotOwnBox);
  } catch (err) {
    console.log(err);
    throw new Error(ErrorCode.InvalidNFTAddress)
  }
}

export const findAssociatedTokenAddress = async(
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
