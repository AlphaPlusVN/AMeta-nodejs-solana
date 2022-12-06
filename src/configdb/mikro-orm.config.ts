import { Options } from '@mikro-orm/core';
import { BoxConfig } from '../entities/BoxConfig';
import { BoxOpenHistory } from '../entities/BoxOpenHistory';
import { SmartContractDataScan } from '../entities/DataScanUser';
import { Item, ItemConfig, ItemSkill } from '../entities/ItemEntity';
import { MarKetConfig } from '../entities/MarketConfig';
import { MktBoxesForSale } from '../entities/MktBoxForSale';
import { MktTransaction } from '../entities/MktTransaction';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { SystemParam } from '../entities/SystemParam';
import { TokenAccount } from '../entities/TokenAccount';
import { TokenWalletHolder } from '../entities/TokenWalletHolder';
import { TransactionGold, TransactionHistory, TransactionItem, TransactionToken } from '../entities/TransactionHistory';
import { User } from '../entities/User';
import { UserBalanceHistory } from '../entities/UserBalanceHistory';
import { WalletAccount } from '../entities/WalletAccount';
import { WalletCache } from '../entities/WalletCache';

/** 
 * Mikro ORM Connection options object
 * If using a different database other than Mongo DB change 
 * the "type" as necessary following the guidelines here: https://mikro-orm.io/docs/usage-with-sql
 *  */
const options: Options = {
  type: 'mongo',
  entities: [User, MarKetConfig, MktBoxesForSale, MktTransaction, WalletCache, TokenAccount, BoxConfig, Item, ItemConfig, ItemSkill, SCNFTMetadata, WalletAccount,
    SystemParam, TransactionHistory, TransactionGold, TransactionToken, UserBalanceHistory, BoxOpenHistory, TransactionItem, SmartContractDataScan, TokenWalletHolder]
};

export default options;