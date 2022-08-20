import { BN, Program, Provider, web3 } from '@project-serum/anchor';
import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
// import idl from './ameta.json'
import ametaIdl from './ameta.json';
import { AMetaData, AMETA_TOKEN, createTokenAccount, findAssociatedTokenAddress, getAMeta, getMasterEditionPDA, getMetadata, getMetadataPDA, initializeMint, MY_WALLET, OWNER_TOKEN_ACCOUNT, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from './SolUtils';

import { createCreateMasterEditionV3Instruction, createCreateMetadataAccountV2Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { isNullOrEmptyString } from '../commons/Utils';
import { ErrorCode } from '../config/ErrorCodeConfig';
import { DI } from '../configdb/database.config';
import { BoxConfig } from '../entities/BoxConfig';
import { Item } from '../entities/ItemEntity';
import { TokenAccount } from '../entities/TokenAccount';
import { User } from '../entities/User';
import { WalletCache } from '../entities/WalletCache';
import { Ameta } from './ameta';
import FishingRodNFT from './FishingRodNFT';
import { MintNFT } from './MintNFT';

const network = clusterApiUrl("devnet");

export const preflightCommitment: web3.ConfirmOptions = {
  preflightCommitment: 'confirmed'
};

export const connection: Connection = new Connection(network, preflightCommitment.preflightCommitment);

export const programID = new PublicKey(ametaIdl.metadata.address);

// export const getProvider = (): Provider => {

//   const provider: Provider = new Provider(connection, new NodeWallet(MY_WALLET), preflightCommitment);
//   return provider;
// }

export const getProgram = (): Program<Ameta> => {
//   const provider = getProvider();
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
      Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, buyerTokenAccount, AMETA_TOKEN, ownerTokenAccount, buyerWallet.publicKey, [buyerWallet, MY_WALLET], price * Math.pow(10, 9), 9),
      Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, senderTokenAccount, tokenAddress, receiverTokenAccount, MY_WALLET.publicKey, [MY_WALLET], 1 * Math.pow(10, 9), 9)
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
        associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
      }
      , signers: [buyerWallet, boxNft]
    });
    console.log("buybox " + buybox);
  } catch (e) {
    console.log(e);
  }
}

export const mintBox = async (walletAddress: string, box: BoxConfig, price: number) => {
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
    let mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);
    let userAta = await Token.getAssociatedTokenAddress(SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, buyerWallet.publicKey);
    let tokenMetadataPubkey = await getMetadataPDA(mint.publicKey);
    let masterEditionPubkey = await getMasterEditionPDA(mint.publicKey);
    let tx = new Transaction();
    let cid = await MintNFT.uploadBoxMetadata(box.code, buyerWallet.publicKey.toBase58());
    tx.add(
      Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, buyerTokenAccount, AMETA_TOKEN, ownerTokenAccount, buyerWallet.publicKey, [MY_WALLET, buyerWallet], price * Math.pow(10, 9), 9),
      SystemProgram.createAccount({
        fromPubkey: MY_WALLET.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await Token.getMinBalanceRentForExemptMint(program.provider.connection),
        programId: TOKEN_PROGRAM_ID
      }),
      Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint.publicKey, 0, MY_WALLET.publicKey, null),
      Token.createAssociatedTokenAccountInstruction(SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, userAta, buyerWallet.publicKey, MY_WALLET.publicKey),
      Token.createMintToInstruction(TOKEN_PROGRAM_ID, mint.publicKey, userAta, MY_WALLET.publicKey, [MY_WALLET, buyerWallet], 1),
      createCreateMetadataAccountV2Instruction({
        metadata: tokenMetadataPubkey,
        mint: mint.publicKey,
        mintAuthority: MY_WALLET.publicKey,
        payer: MY_WALLET.publicKey,
        updateAuthority: MY_WALLET.publicKey,
      }, {
        createMetadataAccountArgsV2: {
          data: {
            name: box.name,
            symbol: "Box",
            uri: cid,
            sellerFeeBasisPoints: 1,
            creators: [
              {
                address: MY_WALLET.publicKey,
                verified: true,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
        },
      }),
      createCreateMasterEditionV3Instruction(
        {
          edition: masterEditionPubkey,
          mint: mint.publicKey,
          updateAuthority: MY_WALLET.publicKey,
          mintAuthority: MY_WALLET.publicKey,
          payer: MY_WALLET.publicKey,
          metadata: tokenMetadataPubkey,
        },
        {
          createMasterEditionArgs: {
            maxSupply: 0,
          },
        }
      )
    )
    tx.feePayer = MY_WALLET.publicKey;
    let hash = await web3.sendAndConfirmTransaction(connection, tx, [MY_WALLET, buyerWallet, mint]);
    console.log("hash " + hash)
    if (!isNullOrEmptyString(hash)) {
      return mint.publicKey.toBase58();
    }
  } catch (e) {
    console.log(e);
    return null;
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
        associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
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
}

export const mintNFTItem = async (walletAddress: string, item: Item) => {
  const program = await getProgram();
  const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
  try {
    let payerSecret = await walletCacheRepo.findOne({ walletAddress: walletAddress });
    const buyerWallet = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(payerSecret.secretKey)));
    //ameta token acc
    const buyerTokenAccount = (await connection.getTokenAccountsByOwner(buyerWallet.publicKey, { mint: AMETA_TOKEN })).value[0].pubkey;
    const ownerTokenAccount = await findAssociatedTokenAddress(OWNER_TOKEN_ACCOUNT, AMETA_TOKEN);
    const ametaBalance = (await program.provider.connection.getTokenAccountBalance(buyerTokenAccount)).value.uiAmount;
    console.log("buyerTokenAccount balance: ", ametaBalance);
    // if (price > ametaBalance) {
    //   throw new Error(ErrorCode.AmountNotEnough);
    // }
    let mint = Keypair.generate();
    console.log(`mint: ${mint.publicKey.toBase58()}`);
    let userAta = await Token.getAssociatedTokenAddress(SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, buyerWallet.publicKey);
    let tokenMetadataPubkey = await getMetadataPDA(mint.publicKey);
    let masterEditionPubkey = await getMasterEditionPDA(mint.publicKey);
    let tx = new Transaction();
    let cid = await MintNFT.uploadItemMetadata(item, buyerWallet.publicKey.toBase58());
    tx.add(
      // Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, buyerTokenAccount, AMETA_TOKEN, ownerTokenAccount, buyerWallet.publicKey, [MY_WALLET, buyerWallet], price * Math.pow(10, 9), 9),
      SystemProgram.createAccount({
        fromPubkey: MY_WALLET.publicKey,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await Token.getMinBalanceRentForExemptMint(program.provider.connection),
        programId: TOKEN_PROGRAM_ID
      }),
      Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint.publicKey, 0, MY_WALLET.publicKey, null),
      Token.createAssociatedTokenAccountInstruction(SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, userAta, buyerWallet.publicKey, MY_WALLET.publicKey),
      Token.createMintToInstruction(TOKEN_PROGRAM_ID, mint.publicKey, userAta, MY_WALLET.publicKey, [MY_WALLET, buyerWallet], 1),
      createCreateMetadataAccountV2Instruction({
        metadata: tokenMetadataPubkey,
        mint: mint.publicKey,
        mintAuthority: MY_WALLET.publicKey,
        payer: MY_WALLET.publicKey,
        updateAuthority: MY_WALLET.publicKey,
      }, {
        createMetadataAccountArgsV2: {
          data: {
            name: item.name,
            symbol: "Item",
            uri: cid,
            sellerFeeBasisPoints: 1,
            creators: [
              {
                address: MY_WALLET.publicKey,
                verified: true,
                share: 100,
              },
            ],
            collection: null,
            uses: null,
          },
          isMutable: true,
        },
      }),
      createCreateMasterEditionV3Instruction(
        {
          edition: masterEditionPubkey,
          mint: mint.publicKey,
          updateAuthority: MY_WALLET.publicKey,
          mintAuthority: MY_WALLET.publicKey,
          payer: MY_WALLET.publicKey,
          metadata: tokenMetadataPubkey,
        },
        {
          createMasterEditionArgs: {
            maxSupply: 0,
          },
        }
      )
    )
    tx.feePayer = MY_WALLET.publicKey;
    let hash = await web3.sendAndConfirmTransaction(connection, tx, [MY_WALLET, buyerWallet, mint]);
    console.log("hash " + hash)
    if (!isNullOrEmptyString(hash)) {
      return mint.publicKey.toBase58();
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}
export async function burnItem(walletAddress: string, item: Item) {
  const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
  let payerSecret = await walletCacheRepo.findOne({ walletAddress: walletAddress });
  const burnWallet = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(payerSecret.secretKey)));
  const mint = new PublicKey(item.nftAddress);
  try {
    let tx = new Transaction();
    const burnTokenAccount = (await connection.getTokenAccountsByOwner(burnWallet.publicKey, { mint: mint })).value[0].pubkey;
    const tokenBalance = await connection.getTokenAccountBalance(burnTokenAccount);
    tx.add(
      Token.createBurnInstruction(TOKEN_PROGRAM_ID, mint, burnTokenAccount, burnWallet.publicKey, [burnWallet], tokenBalance.value.uiAmount),
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, burnTokenAccount, MY_WALLET.publicKey, burnWallet.publicKey, [burnWallet])
    )
    tx.feePayer = MY_WALLET.publicKey;
    let hash = await web3.sendAndConfirmTransaction(connection, tx, [burnWallet, MY_WALLET]);
    console.log("hash=" + hash);
    return hash;
  } catch (e) {
    console.log(e);
    return null;

  }
}

export async function systemTransfer(fromAddress: string, amount: number) {
  const program = await getProgram();
  const [aMetaPDA, bump] = await getAMeta();
  const walletCacheRepo = DI.em.fork().getRepository(WalletCache);
  const tokenAccountRepo = DI.em.fork().getRepository(TokenAccount);
  try {
    let payerSecret = await walletCacheRepo.findOne({ walletAddress: fromAddress });
    const fromWallet = Keypair.fromSecretKey(Uint8Array.from(bs58.decode(payerSecret.secretKey)));
    //ameta token acc
    const buyerTokenAccount = (await connection.getTokenAccountsByOwner(fromWallet.publicKey, { mint: AMETA_TOKEN })).value[0].pubkey;
    const ownerTokenAccount = await findAssociatedTokenAddress(OWNER_TOKEN_ACCOUNT, AMETA_TOKEN);
    let tx = new Transaction();
    tx.add(Token.createTransferCheckedInstruction(TOKEN_PROGRAM_ID, buyerTokenAccount, AMETA_TOKEN, ownerTokenAccount, fromWallet.publicKey, [fromWallet, MY_WALLET], amount * Math.pow(10, 9), 9))
    let hash = await web3.sendAndConfirmTransaction(connection, tx, [fromWallet, MY_WALLET]);
    console.log("hash=" + hash);
    return hash;
  } catch (e) {
    console.log(e);
    return null;

  }
}
