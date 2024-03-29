import { Request, Response } from "express";
import { ResponseDic } from "../config/ErrorCodeConfig";
import { ItemConfig, ItemSkill } from '../entities/ItemEntity';

export const buildResponse = (refNo: string, res: Response, responseDic: ResponseDic, data: any, customMsg?: string) => {
    let responseObj = {
        refNo: refNo,
        responseCode: responseDic.responseCode,
        msg: customMsg ? customMsg : responseDic.msg,
        data: data
    }
    res.status(200).json(responseObj)
}

export const genRandomString = (length: number): string => {
    let result = '';
    const dic = 'qwertyuiopasdfghjklzxcvbnm0123456789';
    for (let i = 0; i < length; i++) {
        let randomIndex = Math.floor(Math.random() * dic.length);
        result = result + dic[randomIndex];
    }
    return result;
}

export const isNullOrEmptyString = (str: string | null | undefined) => {
    if (str == undefined) return true;
    if (str == null) return true;
    if (str.length == 0) return true;

    return false;
};

export function getRandomPercent() {
    return Math.floor(Math.random() * 100);
}

export function getRandomNumber(bound: number) {
    return Math.floor(Math.random() * bound);
}

export function randomFromTo(from: number, to: number) {
    return from + getRandomNumber(to - from);
}
export function getFameByRarity(rare: number) {
    let fame = 900;
    switch (rare) {
        case 0: fame = 1000;
            break;
        case 1: fame = 1400;
            break;
        case 2: fame = 1800;
            break;
        case 3: fame = 2200;
            break;
    }
    return fame;
}

export function generateItemSkill(itemConfig: ItemConfig) {
    let skills = new Array<ItemSkill>();
    if (itemConfig.skill && itemConfig.skill.length > 0) {
        const randomNumber = getRandomNumber(itemConfig.skill.length);
        let skill = itemConfig.skill[randomNumber];
        skills.push(skill);
    }
    //add passive skill
    if (itemConfig.passiveSkill && itemConfig.passiveSkill.length > 0) {
        const randomNumber = getRandomNumber(itemConfig.passiveSkill.length);
        let skill = itemConfig.passiveSkill[randomNumber];
        const fixedSkillValue = randomFromTo(skill.effectValue.from, skill.effectValue.to);
        skill.effectValue.from = fixedSkillValue;
        skill.effectValue.to = fixedSkillValue;
        skills.push(skill);
    }
    return skills;
}

export function stringToArrayBuffer(str:string) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
    }
    return buf;
}