
export class Constants
{
    static readonly STATUS_NO = 0;
    static readonly STATUS_YES = 1;
    static readonly ADDRESS_0 ="0x0000000000000000000000000000000000000000";
    public static readonly SYSTEM_ADMIN = "SYS_ADMIN";
}

export class TokenCode
{
    static readonly AMETA:string = "AMETA";
    static readonly STARTER_BOX:string = "STARTER_BOX";
}

export class ChainCode
{
    static readonly KARDIACHAIN = "KAR";
    static readonly OKC = "OKC";
}

export class SystemParamCode {
    public static readonly USER_CODE = "USER_CODE";
    public static readonly FISHING_TRASH = "FISHING_TRASH";
    public static readonly FISHING_RATE = "FISHING_RATE";
    public static readonly TRANSACTION_NUMBER = "TRANSACTION_NUMBER";

}

export class TransType {
    public static readonly CLAIM_INBOX = "CLAIM_INBOX";
    public static readonly CLAIM_GIFTPACK = "CLAIM_GIFTPACK";
    public static readonly OPEN_BOX = "OPEN_BOX";
    public static readonly ITEM_BURN = "ITEM_BURN";
    public static readonly OBJECT_PICKER = "OBJECT_PICKER";
    public static readonly FISHING_TICKET = "FISHING_TICKET";
    public static readonly WALLET_SYNC = "WALLET_SYNC";
}