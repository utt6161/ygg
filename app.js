
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
import mongodb from 'mongodb'
import { oAuthHandler } from "./controllers/patreonController.js"
import { ygg, wl } from "./db/db.js"
import { authPatreon } from "./controllers/auth.js"
import { authChecks } from "./validators.js"

console.log("Starting yet again.");
console.log("============================================")
// try {
//     if (ygg.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'players'")
//         .get() === undefined) {
//         console.log("No table for players found, creating one")

//         const result = ygg.prepare(`CREATE TABLE players(
//                 id integer primary key autoincrement,
//                 patreonId text,
//                 name text,
//                 uuid text,
//                 expiresAt integer default (strftime('%s','now','+30 days')),
//                 createdAt integer default (datetime('now'))
//             )`).run()
//         console.log("Success")
//     } else {
//         console.log("Players table in place")
//     }
//     if(ygg.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tokens'")
//         .get()===undefined){
//         console.log("No table for player tokens found, creating one")
        
//         const result = ygg.prepare(`CREATE TABLE tokens(
//                 id integer primary key autoincrement,
//                 clientToken text,
//                 accessToken text,
//                 expiresAt integer default (strftime('%s','now','+14 days')),
//                 createdAt integer default (datetime('now')),
//                 playerId integer,
//                 FOREIGN KEY(playerId) REFERENCES players(id) ON DELETE CASCADE
//             `).run()
//         console.log("Success")
//     } else {
//         console.log("Player tokens table in place")
//     }

//     if(wl.prepare("SELECT name from sqlite_master where type = 'table' and name = 'pending'").get() === undefined) {
//         console.log("No table for pending auths found, creating one")
//         const result = ygg.prepare(`
//             create table pending(
//                 id integer primary key autoincrement,
//                 clientToken text,
//                 accessToken text,
//                 expiresAt integer default (strftime('%s','now','+20 seconds'))
//             )
//         `).run()
//         console.log("Success")
//     } else {
//         console.log("Player tokens table in place")
//     }

//     if (wl.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'whitelist'")
//         .get() === undefined) {
//         console.log("No table for whitelisted players found, creating one")

//         // since patreonId is the only
//         // (for sure) unique thing
//         // patreon whitelist will be operating
//         // based on it even though its a mess to get it without
//         // any non-api approach
//         // (patreon -> promote -> site-widget -> link to widget)
//         const result = wl.prepare(`CREATE TABLE whitelist(
//             id integer primary key autoincrement,
//             patreonId integer,
//             createdAt integer default (strftime('%s','now'))
//         );`).run()
//         console.log("Success")
//     } else {
//         console.log("Patreon whitelist db with table in place")
//     }
// } catch (e) {
//     console.log("Couldn't check the databases, terminating..")
//     console.log(e)
//     process.exit(1)
// }


const app = express()
app.set('query parser', (queryString) => {
    return new URLSearchParams(queryString)
})

app.use(express.json());

app.get("/", (req, res) => {
    res.end("you shouldnt be here, bud")
})

app.get(process.env.REDIRECT_PATH, authChecks, authPatreon)


app.post("/auth/refresh", )

app.post("/auth/validate", )

app.post("/auth/signout", )

app.post("/auth/invalidate", )

app.post("/session/join", )

app.get("/session/hasJoined", )


//app.get(process.env.REDIRECT_PATH, oAuthHandler)


app.listen(3000);