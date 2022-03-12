import express from 'express'
import 'dotenv/config'
import { validateAttributes, authChecks, hasJoinedChecks, invalidateChecks, joinChecks, profileChecks, refreshChecks, validateChecks, validateUploadTexture, validateDeleteTexture, validateWhitelistOperations, validateIp } from "./src/utils/validators.js"
import * as fs from 'fs';
import mongoose from "mongoose"
import testAuth from './src/handlers/yggdrasil/testAuth.js'
import refresh from './src/handlers/yggdrasil/refresh.js'
import validate from './src/handlers/yggdrasil/validate.js'
import signout from './src/handlers/yggdrasil/signOut.js'
import invalidate from './src/handlers/yggdrasil/invalidate.js'
import join from './src/handlers/yggdrasil/join.js'
import hasJoined from './src/handlers/yggdrasil/hasJoined.js'
import profile from './src/handlers/yggdrasil/profile.js'
import { textureChecks } from './src/utils/validators.js'
import texture from './src/handlers/texture/texture.js'
import metaData from './src/handlers/yggdrasil/metaData.js'
import auth from './src/handlers/yggdrasil/auth.js'
import attributes from './src/handlers/yggdrasil/attributes.js'
import pkg from 'morgan';
import uploadTexture from './src/handlers/texture/uploadTexture.js';
import deleteTexture from './src/handlers/texture/deleteTexture.js';
import remove from './src/handlers/whitelist/remove.js';
import list from './src/handlers/whitelist/list.js';
import add from './src/handlers/whitelist/add.js';
import info from './src/handlers/whitelist/info.js';
const logger = pkg;

console.log("Starting yet again.");
console.log("============================================")


// ---------------------- filesystem checks ----------------------
if (!fs.existsSync("./keys")) {
    console.log("No keys directory found")
    process.exit(1)
} else {
    if (!fs.existsSync("./keys/public.key") || !fs.existsSync("./keys/private.key")) {
        console.log("Not all key files found, terminatig...")
        process.exit(1)
    }
}

if(!fs.existsSync("./storage/textures/cape")){
    fs.mkdirSync("./storage/textures/cape", { recursive: true })
}

if(!fs.existsSync("./storage/textures/skin")){
    fs.mkdirSync("./storage/textures/skin", { recursive: true })
}


// ----------------------------------------------------------------


const api_prefix = "/api/yggdrasil"
const app = express()

// --------------------- authlib requierment ----------------------

app.get("/*", (req, res, next) => {
    res.setHeader("X-Authlib-Injector-API-Location", process.env.HOST + api_prefix)
    next()
})

app.post("/*", (req, res, next) => {
    res.setHeader("X-Authlib-Injector-API-Location", process.env.HOST + api_prefix)
    next()
})

// ----------------------------------------------------------------

mongoose.connect(process.env.DB_CONNECT, null).then(
    () => { console.log("DB is ready for work") },
    err => { console.log(err.message) }

);

// -------------------- enables req.ip field ----------------------

app.set("trust proxy", true)

// ----------------------------------------------------------------

app.use(express.json())

const logs = logger('dev')
app.use(logs)


// ----------------- here comes the shitshow ----------------------

app.get("/", (req, res) => {
    res.end("you shouldnt be here, bud")
})

app.get(api_prefix, metaData)

app.post(api_prefix + "/authserver/authenticate", testAuth)

app.get(process.env.REDIRECT_PATH, authChecks, auth)

app.post(api_prefix + "/authserver/refresh", refreshChecks, refresh)

app.post(api_prefix + "/authserver/validate", validateChecks, validate)

app.post(api_prefix + "/authserver/signout", signout)

app.post(api_prefix + "/authserver/invalidate", invalidateChecks, invalidate)

app.post(api_prefix + "/sessionserver/session/minecraft/join", joinChecks, join)

app.get("/texture/:type/:hash", textureChecks, texture)

app.get(api_prefix + "/minecraftservices/player/attributes", validateAttributes, attributes)

// username={username}&serverId={serverId}&ip={ip}
app.get(api_prefix + "/sessionserver/session/minecraft/hasJoined", hasJoinedChecks, hasJoined)

// ?unsigned={unsigned}
app.get(api_prefix + "/sessionserver/session/minecraft/profile/:uuid", profileChecks, profile)
                      
app.put(api_prefix + "/api/user/profile/:uuid/:textureType", validateUploadTexture, uploadTexture)

app.delete(api_prefix  + "/api/user/profile/:uuid/:textureType", validateDeleteTexture, deleteTexture)

api.delete(api_prefix + "/whitelist", validateWhitelistOperations, validateIp, remove)

api.post(api_prefix + "/whitelist", validateWhitelistOperations, validateIp, add)

api.get(api_prefix + "/whitelist", validateIp, list)

api.get(api_prefix + "/whitelisted", validateWhitelistOperations, validateIp, info)

app.listen(3000);