import { parseUUID } from "../../utils/UUIDutils.js";
import user from "../../models/user.js";
import { createHasJoinedPayload } from "../../utils/payloads.js";
import { validationResult } from "express-validator";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const uuid = parseUUID(req.params.uuid)
    const unsigned = req.query.unsigned
    user.findOne({
        uuid: uuid
    }, (err, user) => {
        if (!user || err) {
            return res.sendStatus(204)
        }
        res.status(200).send(createHasJoinedPayload(user, unsigned))
        return
    })
}
