// SOLELY FOR THE PURPOSE OF TESTING AUTH OUTSIDE OF
// PATREON OAUTH CONTEXT

import {v5 as uuidv5} from 'uuid';
import * as crypto from 'crypto'
import { createOkAuthPayload } from "../../utils/payloads.js"
import { rmDashes } from '../../utils/UUIDutils.js';
import { v4 } from 'uuid';
import user from '../../models/user.js';
import moment from 'moment';
import { createErrorPayload } from '../../utils/payloads.js';

export default (req, res, next) => {
    const username = "coolguy"
    
    const clientToken = req.body.clientToken ? req.body.clientToken : rmDashes(v4())
    // console.log(clientToken)
    const patreonId = moment().unix().toString()
    user.findOneAndUpdate({
        patreonId: patreonId
    }, {
        name: username,
        patreonId: patreonId,
        uuid: uuidv5(patreonId, process.env.UUID_NAMESPACE),
        accessToken: crypto.randomBytes(64).toString('hex'),
        clientToken: clientToken,
    }, { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
            // console.log("inside a callback")
            if (!doc || err) {
                console.log("something indeed died")
                console.log(err.message)
                console.log(err.stack)
                return res.status(500).send(createErrorPayload(
                    "IllegalArgumentException",
                    "Failed to authorize"
                ))
            }
            else {
                return res.status(200).send(createOkAuthPayload(
                    doc.name,
                    doc.accessToken,
                    doc.clientToken,
                    doc.uuid,
                    true
                ))
            }
        }).lean()

}