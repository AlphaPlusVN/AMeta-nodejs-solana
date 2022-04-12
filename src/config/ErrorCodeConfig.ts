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