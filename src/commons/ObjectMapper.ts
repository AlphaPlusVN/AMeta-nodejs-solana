import { Item, ItemConfig } from '../entities/ItemEntity';
export function newItemFromConfig(config: ItemConfig) {
    let item = new Item();
    if (config) {
        item.attr = config.attr;
        item.buyFee = config.buyFee | 0;
        item.canBuild = config.canBuild | 0;
        item.canStack = config.canStack | 0;
        item.description = config.desc;
        item.durability = config.durabilityMax | 0;
        item.durabilityMax = config.durabilityMax | 0;
        item.group = config.group | 0;
        item.isNFT = config.isNFT | 0;
        item.itemType = config.itemType | 0;
        item.name = config.name;
        item.rank = config.rank | 0;
        item.sellFee = config.sellFee | 0;
        item.imageUrl = config.imageUrl;
        item.nextLevelPoint = config.nextLevelPoint | 0;
        item.nextStarPoint = config.nextStarPoint | 0;
        item.starUpradeRequires = config.starUpradeRequires;
        item.levelUpradeRequires = config.levelUpradeRequires;
        item.code = config.code;
        item.modelId = config.modelId;
        item.mapList = config.mapList;
        item.skill = config.skill;
        item.tribe = config.tribe;
        item.tribeGroup = config.tribeGroup;
    }
    return item;
}

export async function setNewLevelItemData(item: Item) {
    if (item.level == 1) {
        item.nextLevelPoint = 1000;
    } else {
        item.nextLevelPoint = Math.round((item.nextLevelPoint) * 1.2);
    }
}

export async function setNewStarItemData(item: Item) {
    if (item.star == 1) {
        item.nextStarPoint = Math.round(500 * Math.pow(1.5, item.rank));
    } else {
        item.nextStarPoint = Math.round(1100 * Math.pow(1.5, item.rank));
    }
}
export function getItemSaveFromItem(item: Item) {
    let itemSave = {
        itemId: item.id,
        code: item.code,
        itemType: item.itemType,
        modelId: item.modelId,
        rank: item.rank,
        itemName: item.name,
        group: item.group | 0,
        quantity: item.quantity,
        skills: item.skill,
        attr: item.attr
    };
    return itemSave;
}