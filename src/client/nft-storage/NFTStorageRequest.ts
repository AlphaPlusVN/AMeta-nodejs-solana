import { Blob, NFTStorage } from "nft.storage";
const FormData = require('form-data');
export const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU0ZkZENjU4MEMwZjBFNEJDNzRGNDg1MWMyZWY3OWE5MGM2NDk0MzciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NzY4MTY4MTA0NywibmFtZSI6IkFtZXRhIn0.BJo-F4inOElvBDXvAHRTEAhEXdP-kXV5PbC2jBEQJU0";
export namespace NFTStorageClient {
    const client = new NFTStorage({ token: apiKey })
    export async function storeMetadata(meta: string) {
        try {
            const dataInput = new Blob([meta])
            const cid = await client.storeBlob(dataInput);
            return cid;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
