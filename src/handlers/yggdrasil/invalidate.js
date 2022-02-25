import user from "../../models/user.js";
import { validationResult } from "express-validator";

export default (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const clientToken = req.body.accessToken
    user.updateOne({
        clientToken: clientToken,
        accessToken: accessToken
    }, {
        accessToken: null
    }, {
        new: true
    }, (err, user)=>{
        if(err || !user) {
            return res.status(403).send(createErrorPayload(
                "ForbiddenOperation",
                "Failed"
            ))
        }
        return res.status(200).send({})
    })
}