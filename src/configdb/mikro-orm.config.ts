import { Options } from '@mikro-orm/core';
import { User } from '../entities/User';
import { MarKetConfig } from '../entities/MarketConfig';
import { MktBoxesForSale } from '../entities/MktBoxForSale';
import { MktTransaction } from '../entities/MktTransaction';
import { WalletCache } from '../entities/WalletCache';
import { TokenAccount } from '../entities/TokenAccount';
import { BoxConfig } from '../entities/BoxConfig';
import { Item, ItemConfig, ItemSkill } from '../entities/ItemEntity';
import { SCNFTMetadata } from '../entities/NFTMetadataMapping';
import { WalletAccount } from '../entities/WalletAccount';
import { SystemParam } from '../entities/SystemParam';
import { TransactionHistory, TransactionGold, TransactionToken, TransactionItem } from '../entities/TransactionHistory';
import { UserBalanceHistory } from '../entities/UserBalanceHistory';
import { BoxOpenHistory } from '../entities/BoxOpenHistory';
import { SmartContractDataScan } from '../entities/DataScanUser';

/** 
 * Mikro ORM Connection options object
 * If using a different database other than Mongo DB change 
 * the "type" as necessary following the guidelines here: https://mikro-orm.io/docs/usage-with-sql
 *  */
const options: Options = {
  type: 'mongo',
  entities: [User, MarKetConfig, MktBoxesForSale, MktTransaction, WalletCache, TokenAccount, BoxConfig, Item, ItemConfig, ItemSkill, SCNFTMetadata, WalletAccount,
    SystemParam, TransactionHistory, TransactionGold, TransactionToken, UserBalanceHistory, BoxOpenHistory, TransactionItem, SmartContractDataScan]
}; 

export default options;