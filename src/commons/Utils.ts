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

    res.send(responseObj)
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
        case 0: fame = randomFromTo(900, 1100);
            break;
        case 1: fame = randomFromTo(1101, 1300);
            break;
        case 0: fame = randomFromTo(1301, 1500);
            break;
        case 0: fame = randomFromTo(1501, 2000);
            break;
    }
    return fame;
}

export function generateItemSkill(bluePrintCnf: ItemConfig) {
    let skills = new Array<ItemSkill>();
    if (bluePrintCnf.skill) {
        let bound = 0;
        for (let skill of bluePrintCnf.skill) {
            bound += skill.ratePoint;
        }
        let currentPoint = 0;
        const randomNumber = getRandomNumber(bound);
        for (let skill of bluePrintCnf.skill) {
            currentPoint += skill.ratePoint;
            if (randomNumber < currentPoint) {
                skills.push(skill);
                break;
            }
        }
    }
    //add passive skill
    if (bluePrintCnf.passiveSkill) {
        let bound = 0;
        for (let skill of bluePrintCnf.passiveSkill) {
            bound += skill.ratePoint;
        }
        let currentPoint = 0;
        const randomNumber = getRandomNumber(bound);
        for (let skill of bluePrintCnf.passiveSkill) {
            currentPoint += skill.ratePoint;
            if (randomNumber < currentPoint) {
                const fixedSkillValue = randomFromTo(skill.effectValue.from, skill.effectValue.to);
                skill.effectValue.from = fixedSkillValue;
                skill.effectValue.to = fixedSkillValue;
                skills.push(skill);
                break;
            }
        }
    }
    return skills;
}