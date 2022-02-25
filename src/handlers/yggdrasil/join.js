import user from "../../models/user.js";
import { validationResult } from "express-validator";
import { createErrorPayload } from "../../utils/payloads.js";
import moment from "moment";
import pending from "../../models/pending.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const selectedProfile = req.body.selectedProfile
    const serverId = req.body.serverId
    const ip = req.ip

    user.findOne({
        accessToken: accessToken
    }).populate("pending").exec((err, user) => {
        if (err || !user) {
            console.log(err.message)
            return res.status(403).send(createErrorPayload(
                "ForbiddenOperation",
                "Couldnt find the profile"
            ))
        }
        if(user.pending){
            return res.status(403).send(createErrorPayload(
                "ForbiddenOperation",
                "'somebody' is already connecting, try relogin in 1 minute"
            ))
        }
        pending.create({}).then(
            (value => {
                user.pending = value._id.toString()
                user.selectedProfile = selectedProfile
                user.serverId = serverId
                user.validate((err)=>{
                    if(err) return res.send(403).send(err.toString())
                    else user.save().then(savedUser => {
                        return res.sendStatus(204)
                    })
                })
        }), (reason) => {
            console.log(reason)
        })
    })
}