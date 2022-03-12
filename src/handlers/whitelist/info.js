import user from "../../models/user.js";
import { validationResult } from "express-validator"

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const patreonId = req.query.patreonId
    user.find({ patreonId: patreonId }, (err, value) => {
        if(err|| !value) {
            return res.sendStatus(204)
        } else {
            return res.status(200).send(value)
        }
    })
}