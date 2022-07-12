import { buildResponse } from "../commons/Utils";
import { Request, Response } from 'express';
export interface ResponseDic {
    responseCode: string,
    msg: string,
}
export const SUCCESS: ResponseDic = {
    responseCode: '00',
    msg: 'ok',
}
export const AUTH_FAILED: ResponseDic = {
    responseCode: '401',
    msg: 'Token invalid',
}
export enum ErrorCode {
    OK = 'ok',
    TransactionFailed = 'TransactionFailed',
    AuthFailed = 'AuthFailed',
    ParamsIsInvalid = 'ParamsIsInvalid',
    MessageIsInvalid = 'MessageIsInvalid',
    EmailIsExist = 'EmailIsExist',
    UserNameIsExist = 'UserNameIsExist',
    WalletAddressIsNotExist = 'WalletAddressIsNotExist',
    WalletAddressIsInvalid = 'WalletAddressIsInvalid',
    BoxIDIsInvalid = 'BoxIDIsInvalid',
    TransferSigIsInvalid = 'TransferSigIsInvalid',
    WalletNotOwnBox = 'WalletNotOwnBox',
    InvalidBoxType = 'InvalidBoxType',
    InvalidNFTAddress = 'InvalidNFTAddress',
    InvalidTransferSig = 'InvalidTransferSig',

    PaymentMethodNotSupported = 'PaymentMethodNotSupported',
    AmountNotEnough = 'AmountNotEnough',
    
}

export const HandleErrorException = (input: any, res: Response, error: string) => {
    //@ts-ignore
    const errorDetail: ResponseDic = getError(error);

    buildResponse(input.refNo, res, errorDetail, {});

}

export const getError = (error: ErrorCode): ResponseDic => {
    let errorDetail: ResponseDic | null = null;
    switch (error) {
        case ErrorCode.OK: errorDetail = SUCCESS; break;
        case ErrorCode.TransactionFailed: errorDetail = {
            responseCode: '99',
            msg: 'Transaction failed',

        }; break;
        case ErrorCode.AuthFailed: errorDetail = AUTH_FAILED; break;
        case ErrorCode.ParamsIsInvalid: errorDetail = {
            responseCode: '100',
            msg: 'Params is invalid',

        }; break;
        case ErrorCode.MessageIsInvalid: errorDetail = {
            responseCode: '101',
            msg: 'Message is invalid',

        }; break;
        case ErrorCode.EmailIsExist: errorDetail = {
            responseCode: '102',
            msg: 'Email is exist',

        }; break;
        case ErrorCode.UserNameIsExist: errorDetail = {
            responseCode: '102',
            msg: 'User name is exist',

        }; break;
        case ErrorCode.WalletAddressIsNotExist: errorDetail = {
            responseCode: '102',
            msg: 'Wallet address is not exist',

        }; break;
        case ErrorCode.WalletAddressIsInvalid: errorDetail = {
            responseCode: '103',
            msg: 'Wallet address is invalid',

        }; break;
        case ErrorCode.BoxIDIsInvalid: errorDetail = {
            responseCode: '103',
            msg: 'BoxId is invalid',

        }; break;
        case ErrorCode.TransferSigIsInvalid: errorDetail = {
            responseCode: '103',
            msg: 'Transfer sig is invalid',

        }; break;
        case ErrorCode.InvalidNFTAddress: errorDetail = {
            responseCode: '104',
            msg: 'Invalid NFT address',

        }; break;
        case ErrorCode.WalletNotOwnBox: errorDetail = {
            responseCode: '105',
            msg: 'Wallet not own Box',

        }; break;
        case ErrorCode.InvalidBoxType: errorDetail = {
            responseCode: '106',
            msg: 'Invalid Box type',

        }; break;
        
       
        default: errorDetail = {
            responseCode: '999',
            msg: 'Unknown Error'
        }

    }
    return errorDetail;
}