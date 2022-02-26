import { patreon as patreonAPI, oauth as patreonOAuth } from 'patreon'
import { v5 as uuidv5 } from 'uuid';
import * as crypto from 'crypto'
import { createOkAuthPayload, createErrorPayload } from "../../utils/payloads.js"
import { validationResult } from "express-validator"
import user from '../../models/user.js';
import whitelist from '../../models/whitelist.js';

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET)
const redirectURL = process.env.HOST + process.env.REDIRECT_PATH

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const oAuthGrantCode = req.query.code
    const clientToken = req.query.state
    patreonOAuthClient
        .getTokens(oAuthGrantCode, redirectURL)
        .then(tokensResponse => {
            const patreonAPIClient = patreonAPI(tokensResponse.access_token)
            return patreonAPIClient('/current_user')
        })
        .then(({ store }) => {
            const userData = store.findAll('user').map(user => user.serialize())[0];
            whitelist.findOne({
                patreonId: userData.data.id
            }, (err, wlPlayer) => {
                if(err){
                    return res.status(500).send(createErrorPayload(
                        "IllegalArgumentException",
                        "Failed to authorize"
                    ))
                }
                // for the sake of testing
                // condition is set so it works only for those
                // who doesnt have an active pledge
                // switch it to != 0 for the opposite effect
                if (userData.data.relationships.pledges.data.length == 0 || wlPlayer) {
                    user.findOneAndUpdate({
                        patreonId: userData.data.id
                    }, {
                        name: userData.data.attributes.full_name.replace(/ /g, ''),
                        patreonId: userData.data.id,
                        uuid: uuidv5(userData.data.id, process.env.UUID_NAMESPACE),
                        accessToken: crypto.randomBytes(64).toString('hex'),
                        clientToken: clientToken
                    }, { new: true, upsert: true, setDefaultsOnInsert: true },
                        (err, doc) => {
                            if (!doc || err) {
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
                        })
                } else {
                    return res.status(404).send(createErrorPayload(
                        "IllegalArgumentException",
                        "Ваш профиль не имеет подписки на необходимый патреон"
                    ))
                }
            })
        })
}