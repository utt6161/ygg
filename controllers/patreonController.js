// // import url from 'url'
// import { patreon as patreonAPI, oauth as patreonOAuth } from 'patreon'
// import mongodb from 'mongodb'
// import { v4 as uuidv4, v5 as uuidv5, validate as uuidValidate } from 'uuid';
// import * as crypto from 'crypto'
// import { ygg, wl } from "../db/db.js"
// import { createOkAuthPayload, createErrorPayload } from "../utils/payloads.js"

// const { MongoClient } = mongodb
// const CLIENT_ID = process.env.CLIENT_ID
// const CLIENT_SECRET = process.env.CLIENT_SECRET
// const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET)
// const redirectURL = process.env.HOST + process.env.REDIRECT_PATH
// // const MONGODB_STRING = process.env.MONGODB_STRING



// export const oAuthHandler = (request, response) => {
//     if (!request.query.has("code")) {
//         response.status(500).send(createErrorPayload("IllegalArgumentException", "No OAuthGrantCode from patreon provided"))
//         return
//     }
//     const oauthGrantCode = request.query.get("code")
//     const passedState = new Object()
//     if (request.query.has("state")) {
//         let [clientToken, requestUser] = request.query.get("state").split(":")
//         [passedState.clientToken, passedState.requestUser] = [uuidValidate(clientToken) ? clientToken : uuidv4(), requestUser === "true"]
//         console.log(`Got passedState: ${passedState.toString()}`)
//     } else {
//         [passedState.clientToken, passedState.requestUser] = [uuidv4(), false]
//         console.log(`Got no passedState in the request, generated new: ${passedState.toString()}`)
//     }

//     // console.log(request.query.state)
//     // console.log(decodeURIComponent(request.query.state))

//     // console.log(oauthGrantCode)
//     patreonOAuthClient
//         .getTokens(oauthGrantCode, redirectURL)
//         .then(tokensResponse => {
//             const patreonAPIClient = patreonAPI(tokensResponse.access_token)
//             return patreonAPIClient('/current_user')
//         })
//         .then(({ store }) => {
//             const userData = store.findAll('user').map(user => user.serialize())[0];
//             if (!/^[a-zA-Z0-9_]{3,16}$/.test(userData.data.attributes.full_name.replace(/ /g, '')) &&
//                 !/^[a-zA-Z0-9]*_?[a-zA-Z0-9]*$/.test(userData.data.attributes.full_name.replace(/ /g, ''))) {

//                 console.log(`User ${userData.data.attributes.full_name.replace(/ /g, '')} attempted to log in, denied by name-policy`)
//                 response.status(500).send(createErrorPayload(
//                     "IllegalArgumentException",
//                     "Имя пользователя не соответствует политике имен"))

//             } else {

//                 // for the sake of testing
//                 // condition is set so it works only for those
//                 // who doesnt have an active pledge
//                 // switch it to != 0 for the opposite effect
//                 if (userData.data.relationships.pledges.data.length == 0 || 
//                     wl.prepare("select patreonId from whitelist where patreonId = ?").run(userData.data.id) !== undefined) {

//                     try {
//                         const doc = ygg
//                             .prepare(`
//                                 SELECT * FROM players WHERE patreonId=?
//                             `).get(userData.data.id)
//                         if (!doc) {
//                             let okResponce = {
//                                 patreonId: userData.data.id,
//                                 name: userData.data.attributes.full_name.replace(/ /g, ''),
//                                 uuid: uuidv5(userData.data.id, process.env.UUID_NAMESPACE),
//                                 clientToken: passedState.clientToken,
//                                 accessToken: crypto.randomBytes(64).toString('hex'),
//                             }

//                             const insertPlayer = ygg
//                                 .prepare(`
//                                     insert into players (patreonId, name, uuid) values (?, ?, ?)
//                                 `).run(okResponce.patreonId, okResponce.name, okResponce.uuid)

//                             const insertToken = ygg
//                                 .prepare(`
//                                     insert into tokens (clientToken, accessToken, playerId) values (?, ?, ?)
//                                 `).run(okResponce.clientToken, okResponce.accessToken, insertPlayer.lastInsertRowid)

//                             response.status(200).send(createOkAuthPayload(
//                                 okResponce.name,
//                                 okResponce.accessToken,
//                                 okResponce.clientToken,
//                                 okResponce.uuid,
//                                 passedState.requestUser))
//                             return
//                         } else {
//                             let okResponce = {
//                                 patreonId: userData.data.id,
//                                 name: userData.data.attributes.full_name.replace(/ /g, ''),
//                                 uuid: doc.uuid,
//                                 clientToken: passedState.clientToken,
//                                 accessToken: crypto.randomBytes(64).toString('hex'),
//                             }

//                             if (okResponce.name != doc.name) {
//                                 ygg.prepare(`
//                                     update players set name = ? where id = ?
//                                 `).run(okResponce.name, doc.id)
//                             }

//                             const playerToken = ygg.prepare(`
//                                 select t.id as tokenId 
//                                 from tokens as t 
//                                 inner join players as p
//                                 on t.playerId = p.id
//                                 where p.patreonId = ? and t.clientToken = ?
//                             `).run(okResponce.patreonId, okResponce.clientToken);

//                             if (!playerToken) {

//                                 const insertToken = ygg.prepare(`
//                                     insert into tokens (clientToken, accessToken, playerId) values (?, ?, ?)
//                                 `).run(okResponce.clientToken, okResponce.accessToken, doc.id)
                                
//                             } else {

//                                 // it seems that i cant make sqlite use default value
//                                 // upon update, will look it up more
//                                 // but for now, this will suffice
//                                 const updateToken = ygg.prepare(`
//                                     update tokens set accessToken = ?, 
//                                     expiresAt = (strftime('%s','now','+14 days')
//                                     where id = ?
//                                 `).run(okResponce.accessToken, playerToken.tokenId)
//                             }

//                             response.status(200).send(createOkAuthPayload(
//                                 okResponce.name,
//                                 okResponce.accessToken,
//                                 okResponce.clientToken,
//                                 okResponce.uuid,
//                                 passedState.requestUser))
//                             return
//                         }
//                     } catch (e) {
//                         console.log(e)
//                     }
//                 } else {
//                     response.status(404).send(createErrorPayload(
//                         "noPledgeFoundException",
//                         "Ваш профиль не имеет подписки на необходимый патреон"
//                     ))
//                 }
//             }

//         })
//         .catch(err => {
//             console.error('error!', err)
//             response.send(err)
//         })

// }