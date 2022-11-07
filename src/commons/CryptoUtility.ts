import { constants, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt, sign, verify } from 'crypto';

export class RSAUtil {
    publicKey = createPublicKey(this.getPublicKey());
    privateKey = createPrivateKey(this.getPrivateKey());

    static getInstance() {
        const rsa = new RSAUtil();
        return rsa;
    }

    ecryptMessage(data: string) {
        const encryptedData = publicEncrypt(
            {
                key: this.publicKey,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            // We convert the data string to a buffer using `Buffer.from`
            Buffer.from(data)
        );
        return encryptedData.toString("base64");
    }

    decryptMessage(encryptedData: string) {
        const decryptedData = privateDecrypt(
            {
                key: this.privateKey,
                // In order to decrypt the data, we need to specify the
                // same hashing function and padding scheme that we used to
                // encrypt the data in the previous step
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(encryptedData, "base64")
        );
        return decryptedData.toString();
    }

    signMessage(dataSign: string) {
        const signature = sign("sha256", Buffer.from(dataSign), {
            key: this.privateKey,
            padding: constants.RSA_PKCS1_PSS_PADDING,
        });
        return signature.toString("base64");
    }

    verifiedMessage(verifiableData: string, signature: string) {
        const isVerified = verify(
            "sha256",
            Buffer.from(verifiableData),
            {
                key: this.publicKey,
                padding: constants.RSA_PKCS1_PSS_PADDING,
            },
            Buffer.from(signature, "base64")
        );
        return isVerified;
    }

    getPublicKey() {
        const fs = require('fs');
        let jsonFile = __dirname + "/server_publickey.pem";
        let parsed = fs.readFileSync(jsonFile);
        return parsed;
    }

    getPrivateKey() {
        const fs = require('fs');
        let jsonFile = __dirname + "/server_privatekey.pem";
        let parsed = fs.readFileSync(jsonFile);
        return parsed;
    }
}