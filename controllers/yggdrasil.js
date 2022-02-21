import { createErrorPayload, createOkRefreshPayload } from "../utils/payloads.js"
import Prisma from '@prisma/client'
import { signData, getPublicKey } from "../utils/keyUtils.js"
import { parseUUID } from "../utils/UUIDutils.js"
// import { getPrivateKey } from "../utils/keyUtils.js"

const { PrismaClient } = Prisma
const prisma = new PrismaClient()

export const metaDataHandler = (err, req, res, next) => {
    console.log("knocked into meta data")
    res.status(200).send({
        "meta": {
            "implementationName": "ygptr",
            "implementationVersion": "0.8.73",
            "serverName": "whoever"
        },
        "signaturePublickey": getPublicKey()
    })
}

export const profileHandler = (res, req) => {
    const uuid = res.params.uuid
    const unsigned = res.query.unsigned
    prisma.player.findFirst({
        where: {
            uuid: parseUUID(uuid)
        }
    }).then((player) => {
        if (!player) {
            return res.sendStatus(204)
        }
        const texturesValueProperty = {
            "timestamp": Math.floor(new Date().getTime() / 1000),
            "profileId": player.uuid.replace(/-/g, ''),
            "profileName": player.name,
            "textures": {  // Character's material 
                // "SKIN" : {  // If the character does not have this material, you don't have to include 
                //     "url" : " Material URL" , 
                //     "metadata" : {  // The metadata of the material, if it doesn't have 
                //         "name" : "value" 
                //         ,...(can have more) 
                //     } 
                // } 
                // ,...( There can be more) 
            }
        }
        const data = {
            id: player.uuid.replace(/-/g, ''),
            name: player.name,
            properties: [
                {
                    name: "textures",
                    value: Buffer.from(JSON.stringify(texturesValueProperty)).toString('base64'),
                    ...(unsigned ? { signature: Buffer.from(signData(JSON.stringify(texturesValueProperty))).toString('base64') } : {})
                },
                // i will enable this later
                // {
                //     name: "uploadableTextures",
                //     value: "skin,cape"
                // }
            ]
        }
        return res.status(200).send(data)
    })
}

export const joinHandler = (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const selectedProfile = req.body.selectedProfile
    const serverId = req.body.serverId
    const ip = req.ip
    prisma.token.update({
        where: {
            accessToken: accessToken
        },
        data: {
            status: {
                create: {
                    selectedProfile: selectedProfile,
                    serverId: serverId,
                    ip: ip
                }
            }
        }
    }).catch(reason => {
        return res.status(403).send(createErrorPayload(
            "ForbiddenOperation",
            "'something' is already pending"
        ))
    }).then(pending => {
        return res.status(204).send({})
    })


}

export const hasJoinedHandler = (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(204).send({})
    }
    const name = req.query.username
    const serverId = req.query.serverId
    const ip = req.query.ip ? req.query.ip : false

    prisma.user.findFirst({
        where: {
            name: name
        }
    }).then(player => {
        prisma.pending.findFirst({
            where: {
                selectedProfile: player.uuid.replace(/-/g, '')
            },
            include: {
                token: true
            }
        }).then((pendingToken) => {
            if (!pendingToken || (ip && ip != pendingToken.ip) || (serverId != pendingToken.serverId)) {
                return res.status(204).send({})
            }
            prisma.pending.delete({
                where: {
                    id: pendingToken.id
                }
            })
            const unixTimeSeconds = Math.floor(new Date().getTime() / 1000)
            if (pendingToken.createdAt + process.env.PENDING_TTL < unixTimeSeconds) {
                return res.status(204).send({})
            } else {
                const texturesValueProperty = {
                    "timestamp": Math.floor(new Date().getTime() / 1000),
                    "profileId": player.uuid.replace(/-/g, ''),
                    "profileName": player.name,
                    "textures": {  // Character's material 
                        // "SKIN" : {  // If the character does not have this material, you don't have to include 
                        //     "url" : " Material URL" , 
                        //     "metadata" : {  // The metadata of the material, if it doesn't have 
                        //         "name" : "value" 
                        //         ,...(can have more) 
                        //     } 
                        // } 
                        // ,...( There can be more) 
                    }
                }
                const data = {
                    id: player.uuid.replace(/-/g, ''),
                    name: player.name,
                    properties: [
                        {
                            name: "textures",
                            value: Buffer.from(JSON.stringify(texturesValueProperty)).toString('base64'),
                            signature: Buffer.from(signData(JSON.stringify(texturesValueProperty))).toString('base64')
                        },
                        // i will enable this later
                        // {
                        //     name: "uploadableTextures",
                        //     value: "skin,cape"
                        // }
                    ]
                }
                return res.status(200).send(data)
            }
        })
    })
}

export const refreshHandler = (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const clientToken = req.body.clientToken
    const requestUser = req.body.requestUser
    prisma.token.findFirst({
        where: {
            accessToken: accessToken,
            // if the client token was actually provided, search with it
            // as well, overwise, in the validator it will be
            // getting equal to false, which renders this expression to {}
            ...(clientToken ? {
                clientToken: clientToken
            } : {})
        }
    }).then((token) => {
        if (!token) {
            return res.status(403).send(createErrorPayload(
                "IllegalArgumentException",
                "Couldn't find such accessToken/clientToken pair, relogin is required"
            ))
        } else {
            const newAccessToken = crypto.randomBytes(64).toString('hex')
            prisma.token.update({
                where: {
                    id: token.id
                },
                data: {
                    accessToken: newAccessToken,
                    createdAt: Math.floor(new Date().getTime() / 1000)
                },
                include: {
                    player: true
                }
            }).then(token => {
                res.status(200).send(createOkRefreshPayload(
                    token.player.name,
                    token.accessToken,
                    token.clientToken,
                    token.player.uuid,
                    requestUser
                ))
            })
        }
    })

}

export const validateHandler = (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    prisma.token.findFirst({
        where: {
            accessToken: accessToken
        }
    }).then(token => {
        if (!token) {
            return res.status(400).send(createErrorPayload(
                "ForbiddenOperationException",
                "Token expired"
            ))
        } else {
            return res.status(200).send({})
        }
    })
}

export const invalidateHandler = (res, req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(403).send(errors.array()[0].msg)
    }
    const accessToken = req.body.accessToken
    const clientToken = req.body.accessToken
    prisma.token.delete({
        where: {
            clientToken: clientToken,
            accessToken: accessToken
        }
    }).catch(reason => {
        return res.status(403).send(createErrorPayload(
            "ForbiddenOperation",
            "Failed"
        ))
    }).then(token => {
        return res.status(200).send({})
    })
}

export const signoutHandler = (req, res) => {
    // basically patreon has no signout patreon endpoint
    // onto which i can knock with request and as the result, this endpoint is pointless
    // per wiki.vg it should invalidate accessTokens using an account's username and password. 
    // but we strictly do oauth, no log n pass...
    // the conclusion: 
    res.status(418).send("bri'ish tea ye?")
}


