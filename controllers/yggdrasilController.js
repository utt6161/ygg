// import { ygg } from "./db/db.js"
// import { createErrorPayload, createOkRefreshPayload } from "../utils/payloads.js"
// import * as crypto from 'crypto'


// export const joinHandler = (req, res) => {
//     if(!req.body.hasProperty("selectedProfile")  || !req.body.hasProperty("serverId")){
//         res.status
//     }
// }

// export const hasJoinedHandler = (req, res) => {

// }

// export const refreshHandler = (req, res) => {
//     if (req.body.hasProperty("accessToken") && req.body.hasProperty("accessToken")) {

//         const token = ygg.prepare(`
//             select p.name as name, p.uuid as uuid, t.clientToken as clientToken, t.id as tokenId
//             from tokens as t 
//             inner join players as p
//             where t.clientToken = ? and t.accessToken = ?
//         `).get(req.body.accessToken, req.body.clientToken)

//         if(!token){
//             res.status(404).send(createErrorPayload(
//                 "noSuchDataFound",
//                 "Couldn't find such accessToken and clientToken entry, relogin is required"
//             ))
//             return
//         } else {
//             const newAccessToken = crypto.randomBytes(64).toString('hex')
//             const refreshToken = ygg.prepare(`
//                 update tokens set accessToken = ?, 
//                 expiresAt = (strftime('%s','now','+14 days')
//                 where id = ? 
//             `).run(newAccessToken, token.tokenId)
//             let requestUser = req.body.hasProperty("requestUser") && (req.body.requestUser === "true")
//             res.status(200).send(createOkRefreshPayload(
//                 token.name,
//                 newAccessToken,
//                 token.clientToken,
//                 token.uuid,
//                 requestUser
//             ))
//             return
//         }
//     } else {
//         res.status(400).send(createErrorPayload(
//             "ForbiddenOperationException",
//             "No accessToken and/or clientToken provided"
//         ))
//         return
//     }

// }

// export const validateHandler = (req, res) => {
//     if(req.body.hasProperty("accessToken")){
//         const entry = ygg.prepare("select id from tokens where accessToken = ?").run(req.body.accessToken)
//         if(!entry){
//             res.status(400).send(createErrorPayload(
//                 "ForbiddenOperationException",
//                 "Token expired"
//             ))
//         } else {
//             res.status(200).send({})
//         }
//     }
// }

// export const invalidateHandler = (req, res) => {
//     if(req.body.hasProperty("accessToken") && req.body.hasProperty("clientToken")){
//         ygg.prepare("DELETE from tokens WHERE accessToken = ? AND clientToken = ?").run(req.body.accessToken, req.body.clientToken)
//         res.status(200).send({})
//     } else {
//         res.status(400).send(createErrorPayload(
//             "ForbiddenOperationException",
//             "No accessToken and/or clientToken provided"
//         ))
//     }
// }

// export const signoutHandler = (req, res) => {
//     // basically patreon has no signout patreon endpoint
//     // onto which i can knock with request and as the result, this endpoint is pointless
//     // per wiki.vg it should invalidate accessTokens using an account's username and password. 
//     // but we strictly do oauth, no log n pass...
//     // the conclusion: 
//     res.status(418).send("bri'ish tea ye?")
// }


