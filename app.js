
// to get the code
// www.patreon.com/oauth2/authorize/
// ?response_type=code
// &client_id=mZsOwgNPzP_-C3s6jpgb5Dwcjep-rnU5RDS2oWDi6rxPtgfRfs2GcOozTE1jIsF1
// &redirect_uri=https://znkv.win/patreon-redirect
// &state=%7B%22clientToken%22:%225f25a7d9-04c4-4048-b6e3-d0591a4698f3%22,%22requestUser%22:true%7D
// &scope=<optional list of requested scopes>


//5f25a7d9-04c4-4048-b6e3-d0591a4698f3,true

// state = {
//     clientToken: "5f25a7d9-04c4-4048-b6e3-d0591a4698f3",
//     requestUser: true
//   }
// encodeURI( JSON.stringify(state))

// %7B%22clientToken%22:%225f25a7d9-04c4-4048-b6e3-d0591a4698f3%22,%22requestUser%22:false%7D
// result string: %7B%22clientToken%22:%225f25a7d9-04c4-4048-b6e3-d0591a4698f3%22,%22requestUser%22:true%7D
// which then can be safely parsed here into json
import express from 'express'
import 'dotenv/config'
import { authPatreon } from "./controllers/auth.js"
import { authChecks, hasJoinedChecks, invalidateChecks, joinChecks, profileChecks, refreshChecks, validateChecks } from "./validators.js"
import * as fs from 'fs';
import * as crypto from 'crypto'
import { hasJoinedHandler, 
    invalidateHandler, 
    joinHandler, 
    metaDataHandler, 
    profileHandler, 
    refreshHandler, 
    signoutHandler, 
    validateHandler } from './controllers/yggdrasil.js';



console.log("Starting yet again.");
console.log("============================================")

// if anything wrong, just make everything once again
if (!fs.existsSync("./keys")) {
    console.log("No keys directory found")
    fs.mkdirSync("./keys")
    if (!fs.existsSync("./keys/public.pem") || !fs.existsSync("./keys/private.pem")) {
        console.log("Private/public keys found")
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        })
        fs.writeFileSync("./keys/public.pem", publicKey, {
            encoding: "utf-8"
        })
        fs.writeFileSync("./keys/private.pem", privateKey, {
            encoding: "utf-8"
        })
    }
}
if (!fs.existsSync("./storage/textures")) { }

const api_prefix = "/api/yggdrasil"
const app = express()

// apply header to every request, no matter what
// per authlib docs
// app.get("/*", (res, req, next) => {
//     res.header("X-Authlib-Injector-API-Location", process.env.HOST + api_prefix)
//     next()
// })

// app.post("/*", (res, req, next) => {
//     res.header("X-Authlib-Injector-API-Location", process.env.HOST + api_prefix)
//     next()
// })

app.set("trust proxy", true)

app.use(express.json());

app.get("/", (req, res) => {
    res.end("you shouldnt be here, bud")
})

app.get(api_prefix, metaDataHandler)

app.get(process.env.REDIRECT_PATH, authChecks, authPatreon)

app.post(api_prefix + "/authserver/refresh", refreshChecks, refreshHandler)

app.post(api_prefix + "/authserver/validate", validateChecks, validateHandler)

app.post(api_prefix + "/authserver/signout", signoutHandler)

app.post(api_prefix + "/authserver/invalidate", invalidateChecks, invalidateHandler)

app.get(api_prefix + "/sessionserver/session/minecraft/join", joinChecks, joinHandler)

// username={username}&serverId={serverId}&ip={ip}
app.post(api_prefix + "/sessionserver/session/minecraft/hasJoined", hasJoinedChecks, hasJoinedHandler)

// ?unsigned={unsigned}
app.get(api_prefix + "/sessionserver/session/minecraft/profile/:uuid", profileChecks, profileHandler)

//app.get(process.env.REDIRECT_PATH, oAuthHandler)


app.listen(3000);