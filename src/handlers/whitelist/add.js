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

    whitelist.countDocuments({
        patreonId: patreonId
    }, (err, count) => {
        if(count > 0){
            res.status(403).send("Such patreonId is already whitelisted")
        } else {
            whitelist.create({
                patreonId: patreonId
            }).then( (value) => res.status(200).send("Done!"))
            .catch( error => res.status(500).send(error))
        }
    })

    
}