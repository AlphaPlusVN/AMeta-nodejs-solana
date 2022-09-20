export type Payment = {
    method: number;
    price: number;
}
export type FromToObject = {
    from: number;
    to: number;
}
export type DateSchedule = {
    days : Array<number>;
    from: number;
    to: number;
}