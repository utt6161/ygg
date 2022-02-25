import user from "../../models/user.js";
import { createErrorPayload, createHasJoinedPayload } from "../../utils/payloads.js";
import { validationResult } from "express-validator";
import pending from "../../models/pending.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(204)
    }
    const name = req.query.username
    const serverId = req.query.serverId

    // as of right now i wont check
    // the ip's
    const ip = req.query.ip ? req.query.ip : false

    user.findOne({
        name: name,
        serverId: serverId
    }).populate("pending").exec((err, user) => {
        if (err || !user) {
            return res.sendStatus(204)
        }
        if(user.pending) {
            pending.deleteOne({
                _id: user.pending._id
            }).exec(
                (err, result) => {
                    if(!err) return res.status(200).send(createHasJoinedPayload(user, true))
                    else return res.status(403).send(err.toString())
                }
            )
        } else {
            return res.status(403).send(createErrorPayload(
                "IllegalArgumentException",
                "Time to join got expired"
            ))
        }
        
    })
}