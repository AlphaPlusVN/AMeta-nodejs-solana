import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './BaseEntity';

@Entity({ collection: "system_param" })
export class SystemParam extends BaseEntity {
    @Property() code: string;
    @Property() value: any;
    @Property() configType: number; // 0 = share ,1 = private 
}