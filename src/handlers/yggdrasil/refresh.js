import moment from "moment";
import user from "../../models/user.js";
import { validationResult } from "express-validator";
import * as crypto from 'crypto'
import { createErrorPayload, createOkRefreshPayload } from "../../utils/payloads.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const clientToken = req.body.clientToken
    const requestUser = req.body.requestUser
    user.findOne({
            accessToken: accessToken,
            // if the client token was actually provided, search with it
            // as well, overwise, in the validator it will be
            // getting equal to false, which renders this expression to {}
            ...(clientToken ? {
                clientToken: clientToken
            } : {})
    }, (err, user) => {
        if (!user || err) {
            return res.status(403).send(createErrorPayload(
                "IllegalArgumentException",
                "Couldn't find such accessToken/clientToken pair, relogin is required"
            ))
        } else {
            user.accessToken = crypto.randomBytes(64).toString('hex')
            user.createdAt = moment().toDate()
            user.expiresAt = moment().add(process.env.TOKEN_RECORD_TTL, "weeks").toDate()
            user.validate((err)=>{
                if(err) return res.status(403).send(err.toString())
                else user.save().then((savedUser) => {
                return res.status(200).send(createOkRefreshPayload(
                    savedUser.name,
                    savedUser.accessToken,
                    savedUser.clientToken,
                    savedUser.uuid,
                    requestUser
                ))
            })
            })
            
        }})
}