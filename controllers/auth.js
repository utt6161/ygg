import { patreon as patreonAPI, oauth as patreonOAuth } from 'patreon'
import { v4 as uuidv4, v5 as uuidv5, validate as uuidValidate } from 'uuid';
import * as crypto from 'crypto'
import { createOkAuthPayload, createErrorPayload } from "../utils/payloads.js"
import { validationResult } from "express-validator"
import Prisma from '@prisma/client'
const { PrismaClient } = Prisma

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET)
const redirectURL = process.env.HOST + process.env.REDIRECT_PATH
const prisma = new PrismaClient()

export const authPatreon = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const oAuthGrantCode = req.query.code
    const clientToken = req.query.state
    console.log(`Recieved ${oAuthGrantCode} and ${clientToken}`)
    patreonOAuthClient
        .getTokens(oAuthGrantCode, redirectURL)
        .then(tokensResponse => {
            const patreonAPIClient = patreonAPI(tokensResponse.access_token)
            return patreonAPIClient('/current_user')
        })
        .then(({ store }) => {
            const userData = store.findAll('user').map(user => user.serialize())[0];
            if (!/^[a-zA-Z0-9_]{3,16}$/.test(userData.data.attributes.full_name.replace(/ /g, '')) &&
                !/^[a-zA-Z0-9]*_?[a-zA-Z0-9]*$/.test(userData.data.attributes.full_name.replace(/ /g, ''))) {

                console.log(`User ${userData.data.attributes.full_name.replace(/ /g, '')} attempted to log in, denied by name-policy`)
                return res.status(500).send(createErrorPayload(
                    "IllegalArgumentException",
                    "Имя пользователя не соответствует политике имен"))
                
            } else {
                prisma.whitelist.findFirst({
                    where: {
                        patreonId: userData.data.id
                    }
                }).then((wlPlayer) => {
                    // for the sake of testing
                    // condition is set so it works only for those
                    // who doesnt have an active pledge
                    // switch it to != 0 for the opposite effect
                    if (userData.data.relationships.pledges.data.length == 0 || wlPlayer) {
                        console.log(`User ${userData.data.attributes.full_name.replace(/ /g, '')} does have a pledge or is whitelisted, proceeding...`)
                        prisma.player.findFirst({
                            where: {
                                patreonId: userData.data.id
                            },
                            include: {
                                tokens: true
                            }
                        }).then(foundPlayer => {
                            if (!foundPlayer) {
                                console.log(`No records of ${userData.data.attributes.full_name.replace(/ /g, '')} exist, proceeding...`)
                                let okResponce = {
                                    patreonId: userData.data.id,
                                    name: userData.data.attributes.full_name.replace(/ /g, ''),
                                    uuid: uuidv5(userData.data.id, process.env.UUID_NAMESPACE),
                                    clientToken: clientToken,
                                    accessToken: crypto.randomBytes(64).toString('hex'),
                                }
                                prisma.player.create({
                                    data: {
                                        patreonId: okResponce.patreonId,
                                        name: okResponce.name,
                                        uuid: okResponce.uuid,
                                        tokens: {
                                            create: {
                                                clientToken: okResponce.clientToken,
                                                accessToken: okResponce.accessToken
                                            }
                                        }
                                    }
                                }).then(() => {
                                    console.log(`Record of ${userData.data.attributes.full_name.replace(/ /g, '')} created, sending auth data...`)
                                    return res.status(500).send(createOkAuthPayload(
                                        okResponce.name,
                                        okResponce.accessToken,
                                        okResponce.clientToken,
                                        okResponce.uuid,
                                        true))
                                    
                                })
                            } else {
                                console.log(`Record of ${userData.data.attributes.full_name.replace(/ /g, '')} exists, checking...`)
                                let okResponce = {
                                    patreonId: userData.data.id,
                                    name: userData.data.attributes.full_name.replace(/ /g, ''),
                                    uuid: foundPlayer.uuid,
                                    clientToken: clientToken,
                                    accessToken: crypto.randomBytes(64).toString('hex'),
                                }
                                if (okResponce.name != foundPlayer.name) {
                                    prisma.player.update({
                                        where: {
                                            id: foundPlayer.id
                                        },
                                        data: {
                                            name: okResponce.name
                                        }
                                    })
                                }
                                prisma.player.update({
                                    where: {
                                        id: foundPlayer.id
                                    },
                                    data: {
                                        tokens: {
                                            upsert: {
                                                update: {
                                                    accessToken: okResponce.accessToken,
                                                    createdAt: Math.floor(new Date().getTime() / 1000)
                                                },
                                                create: {
                                                    accessToken: okResponce.accessToken,
                                                    clientToken: clientToken
                                                },
                                                where: {
                                                    clientToken: clientToken
                                                }
                                            }
                                        }
                                    },
                                    include: {
                                        tokens: true
                                    }
                                }).then((pl) => {
                                    // console.log(JSON.stringify(pl))
                                    console.log(`Sending auth data of ${userData.data.attributes.full_name.replace(/ /g, '')}`)
                                    return res.status(500).send(createOkAuthPayload(
                                        okResponce.name,
                                        okResponce.accessToken,
                                        okResponce.clientToken,
                                        okResponce.uuid,
                                        true))
                                    
                                })
                            }
                        })
                    } else {
                        return res.status(404).send(createErrorPayload(
                            "IllegalArgumentException",
                            "Ваш профиль не имеет подписки на необходимый патреон"
                        ))
                        
                    }
                })

            }
        })
}