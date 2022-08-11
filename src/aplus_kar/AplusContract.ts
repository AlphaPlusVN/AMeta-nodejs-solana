import { aplusInstance } from '../commons/KardiaUtils';

export async function transferAPlusToken(senderSecret: string, receiverAddress: string, amount: number) {
    const txResult = await aplusInstance.transfer(
        senderSecret,
        receiverAddress,
        amount // Amount of tokens to send
    );
}