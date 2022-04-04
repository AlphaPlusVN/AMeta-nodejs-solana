import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  Program, Provider, web3, BN, Wallet
} from '@project-serum/anchor';
import idl from './outer_space.json'
import { OuterSpace } from './outer_space';
import { MY_WALLET } from './SolUtils';
import { NodeWallet } from '@project-serum/anchor/dist/cjs/provider';

const network = clusterApiUrl("devnet");

export const preflightCommitment: web3.ConfirmOptions = {
  preflightCommitment: 'confirmed'
};

export const connection : Connection = new Connection(network, preflightCommitment.preflightCommitment);

export const programID = new PublicKey(idl.metadata.address);

export const getProvider = () : Provider => {
    
  const provider : Provider = new Provider(connection, new NodeWallet(MY_WALLET), preflightCommitment);
  return provider;
}

export const getProgram = () : Program<any> => {
  const provider = getProvider();
  return new Program<any>(idl, programID, provider);
}

