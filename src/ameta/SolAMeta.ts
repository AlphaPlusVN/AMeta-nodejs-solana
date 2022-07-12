import { clusterApiUrl, Connection, PublicKey, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import {
  Program, Provider, web3, BN
} from '@project-serum/anchor';
// import idl from './ameta.json'
import ametaIdl from './ameta.json';
import { getMetadata, getAMeta, MY_WALLET, AMetaData, TOKEN_METADATA_PROGRAM_ID, findAssociatedTokenAddress, initializeMint, AMETA_TOKEN, OWNER_TOKEN_ACCOUNT, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, createTokenAccount } from './SolUtils';

import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Ameta } from './ameta';
import FishingRodNFT from './FishingRodNFT';
import { ErrorCode } from '../config/ErrorCodeConfig';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';
import { connect, DI } from '../configdb/database.config';
import { User } from '../entities/User';
import { Item } from '../entities/ItemEntity';
import { WalletCache } from '../entities/WalletCache';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { BoxConfig } from '../entities/BoxConfig';
import { TokenAccount } from '../entities/TokenAccount';

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

export const buyBox = async (walletAddress: string, box: BoxConfig, price: number) => {
  const program = await getProgram();
  const [aMetaPDA, bump] = await getAMeta();
  const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
  const tokenAccountRepo = DI.em.fork().getRepository(TokenAccount);
  try {
    let payerSecret = await walletCacheRepo.findOne({ walletAddress: walletAddress });
    const buyerWallet = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(payerSecret.secretKey)));
    //ameta token acc
    const buyerTokenAccount = (await connection.getTokenAccountsByOwner(buyerWallet.publicKey, { mint: AMETA_TOKEN })).value[0].pubkey;
    const ownerTokenAccount = await findAssociatedTokenAddress(OWNER_TOKEN_ACCOUNT, AMETA_TOKEN);
    const ametaBalance = (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount)).value.uiAmount;
    console.log("buyerTokenAccount balance: ", ametaBalance);
    if (price > ametaBalance) {
      throw new Error(ErrorCode.AmountNotEnough);
    }
    //transaction
    // check box tk account
    let boxTokenAcct = await tokenAccountRepo.findOne({ tokenAddress: box.address, walletAddress: walletAddress });
    let tokenAddress = new PublicKey(box.address);
    if (!boxTokenAcct) {
      await createTokenAccount(buyerWallet, tokenAddress, box.code);
    }
    //send box from sender to receiver
    let senderTokenAccount = (await connection.getTokenAccountsByOwner(OWNER_TOKEN_ACCOUNT, { mint: tokenAddress })).value[0].pubkey;
    let receiverTokenAccount = (await connection.getTokenAccountsByOwner(buyerWallet.publicKey, { mint: tokenAddress })).value[0].pubkey;
    let tx = new Transaction();
    tx.add(
      Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, buyerTokenAccount, AMETA_TOKEN, ownerTokenAccount, buyerWallet.publicKey, [buyerWallet, MY_WALLET], price * Math.pow(10,9), 9),
      Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, senderTokenAccount, tokenAddress, receiverTokenAccount, MY_WALLET.publicKey, [MY_WALLET], 1 * Math.pow(10,9), 9)
    )
    tx.feePayer = MY_WALLET.publicKey;
    let hash = await web3.sendAndConfirmTransaction(connection, tx, [buyerWallet, MY_WALLET]);
    console.log("hash ==" + hash);
  } catch (e) {
    console.error(e);
    throw e
  }
}

export const buyBoxNew = async (user: User) => {
  try {
    const program = await getProgram();
    const [aMetaPDA, bump] = await getAMeta();
    const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
    let payerSecret = await walletCacheRepo.findOne({ walletAddress: user.walletAddress });
    const buyerWallet = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(payerSecret.secretKey)));

    const boxNft = Keypair.generate();

    const ametaToken = AMETA_TOKEN;
    console.log("buyer " + user.walletAddress);
    const buyerTokenAccount = (await connection.getTokenAccountsByOwner(buyerWallet.publicKey, { mint: ametaToken })).value[0].pubkey;
    const ownerTokenAccount = await findAssociatedTokenAddress(OWNER_TOKEN_ACCOUNT, ametaToken);

    console.log("get buyer acc " + buyerTokenAccount);
    const boxVault = await findAssociatedTokenAddress(buyerWallet.publicKey, boxNft.publicKey);
    const metadataAddress = await getMetadata(boxNft.publicKey);
    console.log("buyerTokenAccount balance: ", (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount)).value.uiAmount);
    let buybox = await program.rpc.buyBox(bump, 'BOX1', 'STARTER_BOX', {
      accounts: {
        aMeta: aMetaPDA,
        payer: buyerWallet.publicKey,
        boxMint: boxNft.publicKey,
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
      , signers: [buyerWallet, boxNft]
    });
    console.log("buybox " + buybox);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export const openBox = async (payer: string, boxAddress: string) => {
  try {
    let fishingRod = new FishingRodNFT();
    let fishingRodTokenMetadata = await fishingRod.generate(MY_WALLET.publicKey.toString());
    let fishingRodUri = await fishingRod.upload();
    let fishingRodMint = Keypair.generate();
    const [aMetaPDA, bump] = await getAMeta();
    const program = await getProgram();
    const buyerWallet = new web3.PublicKey(payer);
    const boxVault = await findAssociatedTokenAddress(MY_WALLET.publicKey, new web3.PublicKey(boxAddress));
    let ownerVault = await findAssociatedTokenAddress(MY_WALLET.publicKey, fishingRodMint.publicKey);
    const metadataAddress = await getMetadata(fishingRodMint.publicKey);

    let buyerVault = Keypair.generate();
    await initializeMint(0, fishingRodMint);
    console.log('Mint  ' + await program.provider.connection.getAccountInfo(fishingRodMint.publicKey))
    let create_buyer_token_tx = new Transaction().add(

      SystemProgram.createAccount({
        fromPubkey: program.provider.wallet.publicKey,
        newAccountPubkey: buyerVault.publicKey,
        space: AccountLayout.span,
        lamports: await Token.getMinBalanceRentForExemptAccount(program.provider.connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        fishingRodMint.publicKey, // mint
        buyerVault.publicKey, // token account
        buyerWallet // owner of token account
      ),

    );

    await program.provider.send(create_buyer_token_tx, [buyerVault]);
    console.log("buyerVault balance: ", (await program.provider.connection.getTokenAccountBalance(buyerVault.publicKey)).value.uiAmount);
    let sig = await program.rpc.openBox(bump, fishingRodUri, fishingRodTokenMetadata.name, {
      accounts: {
        aMeta: aMetaPDA,
        owner: MY_WALLET.publicKey,
        boxMint: new web3.PublicKey(boxAddress),
        boxTokenAccount: boxVault,
        fishingRodMint: fishingRodMint.publicKey,
        ownerVault: ownerVault,
        buyerVault: buyerVault.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        metadata: metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [
        // fishingRodMint,
        MY_WALLET
      ]
    })
    const userRepo = DI.em.fork().getRepository(User);
    const itemRepo = DI.em.fork().getRepository(Item);
    const user: User = await userRepo.findOne({ walletAddress: payer });
    const newFishingRod = await itemRepo.create({
      owner: user._id.toString(),
      itemType: 3,
      name: 'FISHING_ROD',
      description: 'Fishing-Rod, relax with fishing',
    })
    itemRepo.persistAndFlush(itemRepo);
    return sig;
  } catch (err) {
    console.log(err);
    throw new Error(ErrorCode.TransactionFailed);
  }
  return null;
}

