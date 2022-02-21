import * as fs from 'fs';
import * as crypto from 'crypto';

export const getPublicKey = () => {
    const publicKey = fs.readFileSync("../keys/public.pem", {
        encoding: "utf-8"
    })
    console.log(publicKey)
    if(!publicKey) throw new Error("SOMETHING DIED WTF")
    return publicKey
}

export const getPrivateKey = () => {
    return fs.readFileSync("../keys/private.pem", {
        encoding: "utf-8"
    })
}

export const signData = (data) => {
    const sign = crypto.createSign('sha1WithRSAEncryption');
    sign.update(data);
    sign.end();
    const signature = sign.sign(privateKey);
    return signature.toString('base64')
}