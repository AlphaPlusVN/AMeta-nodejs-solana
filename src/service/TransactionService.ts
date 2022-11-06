import { TransactionHistory, TransactionToken, TransactionItem, TransactionGold } from '../entities/TransactionHistory';
import { getSystemConfigParam } from './ServiceCommon';
import { SystemParamCode } from '../commons/Constants';
import { DI } from '../configdb/database.config';
import { SystemParam } from '../entities/SystemParam';
import { Item } from '../entities/ItemEntity';
import { UserBalanceHistory } from '../entities/UserBalanceHistory';
import { User } from '../entities/User';
import { getItemSaveFromItem } from '../commons/ObjectMapper';
export async function saveTransaction(from: string, to: string, transType: string, transactionData: any, requestId: string, refId: string, description: string) {
    let th = new TransactionHistory();
    let systemParam = await getSystemConfigParam(SystemParamCode.TRANSACTION_NUMBER);
    let transactionNumber = parseInt(systemParam.value + "") + 1;
    th.transactionNumber = transactionNumber;
    th.createdBy = from;
    th.from = from;
    th.to = to;
    th.transType = transType;
    th.transactionData = JSON.stringify(transactionData);
    th.refId = refId;
    th.requestId = requestId;
    th.description = description;
    const systemParamRepo = DI.em.fork().getRepository(SystemParam);
    systemParam.value = transactionNumber;
    await systemParamRepo.persistAndFlush(systemParam);
    const transactionRepo = DI.em.fork().getRepository(TransactionHistory);
    await transactionRepo.persistAndFlush(th);
    return th;
}

export async function saveTokenTransaction(from: string, to: string, token: number, transNumber: number) {
    let tokenTrans = new TransactionToken();
    tokenTrans.from = from;
    tokenTrans.to = to;
    tokenTrans.token = token;
    tokenTrans.transactionNumber = transNumber;
    const tokenTransRepo = DI.em.fork().getRepository(TransactionToken);
    await tokenTransRepo.persistAndFlush(tokenTrans);
    return tokenTrans;
}

export async function saveItemTransaction(from: string, to: string, items: Array<Item>, transNumber: number) {
    let itemTrans = new TransactionItem();
    itemTrans.from = from;
    itemTrans.to = to;
    let itemSaves = new Array<any>();
    for (let item of items) {
        itemSaves.push(getItemSaveFromItem(item));
    }
    itemTrans.items = itemSaves;
    itemTrans.transactionNumber = transNumber;
    const itemTransRepo = DI.em.fork().getRepository(TransactionItem);
    await itemTransRepo.persistAndFlush(itemTrans);
    return itemTrans;
}

export async function saveGoldTransaction(from: string, to: string, gold: number, transNumber: number) {
    let goldTrans = new TransactionGold();
    goldTrans.from = from;
    goldTrans.to = to;
    goldTrans.gold = gold;
    goldTrans.transactionNumber = transNumber;
    const goldTransRepo = DI.em.fork().getRepository(TransactionGold);
    await goldTransRepo.persistAndFlush(goldTrans);
    return goldTrans;
}

export async function saveUserBalanceHistory(user: User, goldChange: number, tokenChange: number, transNumber: number) {
    let userBalanceChange = new UserBalanceHistory();
    userBalanceChange.userId = user.id;
    userBalanceChange.gold = user.gem;
    userBalanceChange.token = user.token;
    userBalanceChange.goldChange = goldChange;
    userBalanceChange.tokenChange = tokenChange;
    userBalanceChange.transactionNumber = transNumber;
    const userBalanceRepo = DI.em.fork().getRepository(UserBalanceHistory);
    await userBalanceRepo.persistAndFlush(userBalanceChange);

}
