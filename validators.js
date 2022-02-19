import { query } from "express-validator"
import { v4 } from "uuid"
import { createErrorPayload } from "./utils/payloads.js"

export const authChecks = [
    query("code").exists({
        checkNull:true,
        checkFalsy:true
    }).withMessage(createErrorPayload(
        "IllegalArgumentException",
        "No OAuthGrantCode from patreon provided"
    )).bail(),
    query("state").default(v4())
    
]