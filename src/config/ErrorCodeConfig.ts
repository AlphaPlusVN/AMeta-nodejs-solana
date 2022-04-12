export interface ResponseDic {
    responseCode: string,
    msg: string,
}

export const SUCCESS : ResponseDic = {
    responseCode: '00',
    msg: 'ok'
}
export const AUTH_FAILD : ResponseDic = {
    responseCode: '401',
    msg: 'Token invalid'
}
export const PARAMS_INVALID : ResponseDic = {
    responseCode: '100',
    msg: 'Params is invalid'
}
export const MESSAGE_INVALID : ResponseDic = {
    responseCode: '101',
    msg: 'Message is invalid'
}
export const EMAIL_EXIST : ResponseDic = {
    responseCode: '102',
    msg: 'Email is exist'
}
export const USERNAME_EXIST : ResponseDic = {
    responseCode: '102',
    msg: 'User name is exist'
}
export const WALLET_NOT_EXIST : ResponseDic = {
    responseCode: '102',
    msg: 'Wallet address is not exist'
}