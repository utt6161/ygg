import { query, body, param, header } from "express-validator"
import { v4, validate } from "uuid"
import { createErrorPayload } from "./payloads.js"
import { parseUUID, rmDashes } from "./UUIDutils.js"
import multer from 'multer'

export const authChecks = [
    query("code").exists({
        checkNull: true,
        checkFalsy: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No OAuthGrantCode from patreon provided"
    )).bail(),
    query("state").replace(['', null, undefined, NaN, 'None'], rmDashes(v4()))
]

export const profileChecks = [
    param("uuid").custom(uuid => validate(parseUUID(uuid))).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "invalid UUID"
    )).bail(),
    query("unsigned").optional().isBoolean().toBoolean()
]

export const joinChecks = [
    body("selectedProfile").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "no selectedProfile"
    )).bail(),
    body("serverId").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "no serverId"
    )).bail(),
    body("accessToken").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "no accessToken"
    ))
]

export const hasJoinedChecks = [
    query("username").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No username provided"
    )).bail(),
    query("serverId").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No serverId provided"
    )).bail(),
    query("ip").optional().isIP()
]

export const refreshChecks = [
    body("requestUser").replace(['', null, undefined, NaN, 'None'], false)
        .isBoolean().withMessage(createErrorPayload(
            "IllegalArgumentException",
            "RequestUser field isn't a boolean"
        )).bail(),
    body("accessToken").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No accessToken provided"
    )).bail(),
    body("clientToken").replace(['', null, undefined, NaN, 'None'], false)
]

export const validateChecks = [
    body("accessToken").exists({
        checkFalsy: true,
        checkNull: true
    })
]

export const invalidateChecks = [
    body("accessToken").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No accessToken provided"
    )).bail(),
    body("clientToken").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No clientToken provided"
    ))
]

export const textureChecks = [
    param("type").exists({
        checkFalsy: true,
        checkNull: true
    }).custom(value => ["skin", "cape"].includes(value)).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "Illigal texture type"
    )).bail(),
    param("hash").exists({
        checkFalsy: true,
        checkNull: true
        // we literally check if its a hash looking kinda string
        // or.. s t e v e, which is a default one, yep
    }).custom(value => ((/a-f0-9]{64}/.test(value)) || (value === "steve"))).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No valid texture hash provided"
    ))
]

export const validateAttributes = [
    header("Authorization").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No bearer token provided"
    ))
]

const storage = multer.memoryStorage()

const update = multer({
    storage: storage,
    limits: {
        fileSize: 17000,
        files: 1,
        fields: 1
    }
}).single("file")



export const validateUploadTexture = [
    // for some reason if the update goes after body check
    // body cant see model field
    // i have no fucking idea
    update,
    header("Authorization").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No bearer token provided"
    )).bail(),
    body("model").custom((value, meta) => {
        return (["default", "slim"].includes(value) || meta.req.params.textureType === "cape")
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "Illigal texture type"
    )).bail(),
    param("uuid").custom(uuid => validate(parseUUID(uuid)))
        .withMessage(createErrorPayload(
            "IllegalArgumentException",
            "invalid UUID"
        )).bail(),
    param("textureType").custom(value => {
        return ["skin", "cape"].includes(value)
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "invalid textureType"
    )).bail()
]

export const validateDeleteTexture = [
    header("Authorization").exists({
        checkFalsy: true,
        checkNull: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No bearer token provided"
    )).bail(),
    param("uuid").custom(uuid => validate(parseUUID(uuid)))
        .withMessage(createErrorPayload(
            "IllegalArgumentException",
            "invalid UUID"
        )).bail(),
    param("textureType").custom(value => ["skin", "cape"].includes(value))
        .withMessage(createErrorPayload(
            "IllegalArgumentException",
            "invalid textureType"
        ))
]
