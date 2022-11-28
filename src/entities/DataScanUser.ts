import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "sm_data_scan" })
export class SmartContractDataScan extends BaseEntity {
    @Property() chainId: number;
    @Property() contractAddress: string;
    @Property() walletOwner: string;
    @Property() dataType: number; //0 token //1 box 2//nft
}