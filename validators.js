import { query, body, param } from "express-validator"
import { v4 } from "uuid"
import { createErrorPayload } from "./utils/payloads.js"

export const authChecks = [
    query("code").exists({
        checkNull: true,
        checkFalsy: true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No OAuthGrantCode from patreon provided"
    )),
    query("state").replace(['', null, undefined, NaN, 'None'], v4().replace(/-/,''))
]

export const profileChecks = [
    param("uuid").exists({
        checkNull: true,
        checkFalsy: true
    }).isUUID().withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No UUID provided"
    )).bail(),
    query("unsigned").optional().isBoolean()
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