import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from "path"

export const getPublicKey = () => {
    return fs.readFileSync(path.resolve() + "/keys/public.key", {
        encoding:'utf-8'
    })
}

export const getPrivateKey = () => {
    return fs.readFileSync(path.resolve() + "/keys/private.key", {
        encoding:'utf-8'
    })
}

export const signData = (data) => {
    const sign = crypto.createSign('sha1WithRSAEncryption');
    const key = crypto.createPrivateKey(getPrivateKey())
    sign.update(data);
    sign.end();
    const signature = sign.sign(key, 'base64');
    return signature
}