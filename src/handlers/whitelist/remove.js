import whitelist from "../../models/whitelist.js";
import { validationResult } from "express-validator"

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const patreonId = req.query.patreonId
    let users = []
    whitelist.deleteOne({ patreonId: patreonId }, (err, value) => {
        if(err) {
            return res.sendStatus(204)
        }
        return res.sendStatus(200)
    })
}