import moment from "moment";
import user from "../../models/user.js";
import { validationResult } from "express-validator";
import { createErrorPayload } from "../../utils/payloads.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    user.findOne({
        accessToken: accessToken
    }, (err, user) => {
        if (!user || err) {
            return res.status(400).send(createErrorPayload(
                "ForbiddenOperationException",
                "Token expired or something else happened, relogin recommended"
            ))
        }
        if(moment().isBefore(user.expiresAt)) {
            return res.status(400).send(createErrorPayload(
                "ForbiddenOperationException",
                "Token expired or something else happened, relogin recommended"
            ))
        }
        return res.status(200).send({})
    }).lean()
}