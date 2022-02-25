
import { getPublicKey } from "../../utils/keyUtils.js"

export default (req, res, next) => {
    res.status(200).send({
        "meta": {
            "implementationName": "ygptr",
            "implementationVersion": "0.8.73",
            "serverName": "immense bruhness of existence"
        },
        "skinDomains" :  [ 
            "znkv.win" , 
            ".znkv.win" 
        ], 
        "signaturePublickey": getPublicKey()
    })
}