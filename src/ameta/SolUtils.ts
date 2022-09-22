// import * as anchor from '@project-serum/anchor';
// import { web3 } from '@project-serum/anchor';
// import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
// import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
// import {
//   Keypair,
//   PublicKey,
//   SystemProgram, Transaction
// } from '@solana/web3.js';
// import fs from 'fs';
// import { sign } from 'tweetnacl';
// import { connection, getProgram } from './SolAMeta';
// // import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
// import {
//   PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID
// } from "@metaplex-foundation/mpl-token-metadata";
// import { programs } from '@metaplex/js';
// import { Constants } from '../commons/Constants';
// import { ErrorCode } from '../config/ErrorCodeConfig';
// import { DI } from '../configdb/database.config';
// import { TokenAccount } from '../entities/TokenAccount';
// const { metadata: { Metadata } } = programs;
// export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
//   new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
// const PREFIX = 'a_meta';

// export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
//   'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
// );

// export const AMETA_TOKEN = new web3.PublicKey('9ezfMjPwsPfRtRi41PER8xFpZDQCm2ccTj488uqGguT6');
// export const OWNER_TOKEN_ACCOUNT = new web3.PublicKey('BfvHGfacbqHe58NSD8mJQB9ZNqPb7ZG7gWHNRSAzwefh');

// // export const getAtaForMint = async (
// //   mint: anchor.web3.PublicKey,
// //   buyer: anchor.web3.PublicKey,
// // ): Promise<[anchor.web3.PublicKey, number]> => {
// //   return await anchor.web3.PublicKey.findProgramAddress(
// //     [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
// //     SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
// //   );
// // };


// export interface AMetaData {
//   symbol: string;
//   price: anchor.BN;
// }

// export const getAMeta = async () => {
//   let aMetaProgram = await getProgram();
//   return await PublicKey.findProgramAddress(
//     [Buffer.from(PREFIX)],
//     aMetaProgram.programId
//   )

// }

// export const MY_WALLET: Keypair = web3.Keypair.fromSecretKey(
//   new Uint8Array(
//     JSON.parse(fs.readFileSync(__dirname + '/ametakeypair.json').toString())
//   )
// )

// export const createAssociatedTokenAccountInstruction = (
//   associatedTokenAddress: anchor.web3.PublicKey,
//   payer: anchor.web3.PublicKey,
//   walletAddress: anchor.web3.PublicKey,
//   splTokenMintAddress: anchor.web3.PublicKey,
// ) => {
//   const keys = [
//     { pubkey: payer, isSigner: true, isWritable: true },
//     { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
//     { pubkey: walletAddress, isSigner: false, isWritable: false },
//     { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SystemProgram.programId,
//       isSigner: false,
//       isWritable: false,
//     },
//     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
//       isSigner: false,
//       isWritable: false,
//     },
//   ];
//   return new anchor.web3.TransactionInstruction({
//     keys,
//     programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
//     data: Buffer.from([]),
//   });
// };

// export const getMetadata = async (
//   mint: anchor.web3.PublicKey,
// ): Promise<anchor.web3.PublicKey> => {
//   return (
//     await anchor.web3.PublicKey.findProgramAddress(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mint.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     )
//   )[0];
// };

// export const isValidMessage = (msg: string, walletAddress: string, sig: string) => {
//   const message = new TextEncoder().encode(msg);
//   const sigDecode = bs58.decode(sig);
//   const wallet = new PublicKey(walletAddress);
//   // console.log(message, new Uint8Array(sig), wallet);
//   let verified = sign.detached.verify(message, new Uint8Array(sigDecode), wallet.toBytes())
//   return verified;
// }

// export const getMetadataNFT = async (address: string) => {
//   const metadataPDA = await Metadata.getPDA(new PublicKey(address));
//   const tokenMetadata = await Metadata.load(connection, metadataPDA);
//   let metadata: programs.metadata.MetadataData = tokenMetadata.data;
//   console.log(metadata);
// }

// export const validateBoxAddress = async (boxAddress: string, walletAddress: string) => {
//   try {
//     const metadataPDA = await Metadata.getPDA(new PublicKey(boxAddress));
//     const tokenMetadata = await Metadata.load(connection, metadataPDA);
//     console.log(tokenMetadata);
//     let metadata: programs.metadata.MetadataData = tokenMetadata.data;
//     if (!metadata) {
//       throw new Error(ErrorCode.InvalidNFTAddress)
//     }
//     if (metadata.updateAuthority != walletAddress) throw new Error(ErrorCode.WalletNotOwnBox);
//   } catch (err) {
//     console.log(err);
//     throw new Error(ErrorCode.InvalidNFTAddress)
//   }
// }

// export const findAssociatedTokenAddress = async (
//   walletAddress: PublicKey,
//   tokenMintAddress: PublicKey
// ): Promise<PublicKey> => {
//   return (await PublicKey.findProgramAddress(
//     [
//       walletAddress.toBuffer(),
//       TOKEN_PROGRAM_ID.toBuffer(),
//       tokenMintAddress.toBuffer(),
//     ],
//     SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
//   ))[0];
// }

// export const initializeMint = async (
//   decimals: number,
//   token: web3.Keypair,
// ) => {
//   const program = await getProgram();
//   let create_mint_tx = new Transaction().add(
//     // create mint account
//     SystemProgram.createAccount({
//       fromPubkey: program.provider.wallet.publicKey,
//       newAccountPubkey: token.publicKey,
//       space: MintLayout.span,
//       lamports: await Token.getMinBalanceRentForExemptMint(program.provider.connection),
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     // init mint account
//     Token.createInitMintInstruction(
//       TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
//       token.publicKey, // mint pubkey
//       decimals, // decimals
//       program.provider.wallet.publicKey, // mint authority
//       program.provider.wallet.publicKey // freeze authority (if you don't need it, you can set `null`)
//     )
//   );

//   await program.provider.send(create_mint_tx, [token]);
// }

// export const createTokenAccount = async (wallet: Keypair, token: PublicKey, tokenCode: string) => {
//   try {
//     const program = await getProgram();
//     let tx = new Transaction();
//     let trx;
//     let seed = tokenCode;
//     let tokenAccount = await PublicKey.createWithSeed(wallet.publicKey, seed, TOKEN_PROGRAM_ID);
//     console.log("My token acct " + tokenAccount);
//     tx.add(
//       SystemProgram.createAccountWithSeed({
//         fromPubkey: MY_WALLET.publicKey,
//         newAccountPubkey: tokenAccount,
//         space: AccountLayout.span,
//         basePubkey: wallet.publicKey,
//         seed: seed,
//         lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
//         programId: TOKEN_PROGRAM_ID
//       }),
//       //init token to account
//       Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, token, tokenAccount, wallet.publicKey)
//     )
//     trx = await connection.sendTransaction(tx, [MY_WALLET, wallet]);
//     console.log("transaction - " + trx);
//     //save to db
//     let tokenAccountRepo = DI.em.fork().getRepository(TokenAccount);
//     let tokenAccountSave = new TokenAccount();
//     tokenAccountSave.walletAddress = wallet.publicKey.toBase58();
//     tokenAccountSave.inactive = Constants.STATUS_NO;
//     tokenAccountSave.tokenAddress = token.toBase58();
//     tokenAccountSave.tokenCode = tokenCode;
//     tokenAccountRepo.persistAndFlush(tokenAccountSave);
//   } catch (e) {
//     console.error(e);
//   }
// }
// export async function getMetadataPDA(mint: PublicKey): Promise<PublicKey> {
//   const [publicKey] = await PublicKey.findProgramAddress(
//     [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
//     MPL_TOKEN_METADATA_PROGRAM_ID
//   );
//   return publicKey;
// }

// export async function getMasterEditionPDA(mint: PublicKey): Promise<PublicKey> {
//   const [publicKey] = await PublicKey.findProgramAddress(
//     [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
//     MPL_TOKEN_METADATA_PROGRAM_ID
//   );
//   return publicKey;
// }