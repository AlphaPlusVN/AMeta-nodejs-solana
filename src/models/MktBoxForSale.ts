import { Document } from "mongodb"
export interface MktBoxesForSale extends Document{
   boxId: string,
   originPrice: string,
   price: string,
   avatar: string,
   status: "0" | "1",

}