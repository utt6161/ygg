import { patreon as patreonAPI, oauth as patreonOAuth } from 'patreon'
import { v4 as uuidv4, v5 as uuidv5, validate as uuidValidate } from 'uuid';
import * as crypto from 'crypto'
import { createOkAuthPayload, createErrorPayload } from "../utils/payloads.js"

export const authPatreon = (req, res, next) => {

}