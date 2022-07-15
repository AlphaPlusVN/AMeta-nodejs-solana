import { Options } from '@mikro-orm/core';
import { User } from '../entities/User';
import { MarKetConfig } from '../entities/MarketConfig';
import { MktBoxesForSale } from '../entities/MktBoxForSale';
import { MktTransaction } from '../entities/MktTransaction';
import { WalletCache } from '../entities/WalletCache';
import { TokenAccount } from '../entities/TokenAccount';
import { BoxConfig } from '../entities/BoxConfig';
import { Item, ItemConfig } from '../entities/ItemEntity';

/** 
 * Mikro ORM Connection options object
 * If using a different database other than Mongo DB change 
 * the "type" as necessary following the guidelines here: https://mikro-orm.io/docs/usage-with-sql
 *  */
const options: Options = {
  type: 'mongo',
  entities: [User, MarKetConfig, MktBoxesForSale, MktTransaction, WalletCache, TokenAccount, BoxConfig, Item, ItemConfig]
}; 

export default options;