// import { ygg } from "./db/db.js"

// Every minute     "0 * * ? * *"
// Every 12 hours   "0 0 */12 ? * *"

import Prisma from '@prisma/client'
const { PrismaClient } = Prisma
const prisma = new PrismaClient()

console.log("Checking for any expiried tokens")
try {
    // if (ygg.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'tokens'")
    //     .get() === undefined || ygg.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = 'players'")
    //     .get() === undefined) {
    //     console.log("Table for the players and/or tokens doesn't exist yet")
    // } else {
    //     const result = ygg.prepare("SELECT * FROM tokens").all()
    //     // console.log(result)
    //     const unixTimeSeconds = Math.floor(new Date().getTime() / 1000)
    //     for(const item of result){
    //         if(item.expiresAt <= unixTimeSeconds) {
    //             ygg.prepare("DELETE from tokens WHERE id = ?").run(item.id)
    //             console.log(`One record expired: ${item}`)
    //         }
    //     }
    // }
    const unixTimeSeconds = Math.floor(new Date().getTime() / 1000)
    prisma.token.deleteMany({
        where:{
            createdAt: {
                lt: unixTimeSeconds - process.env.TOKEN_RECORD_TTL
            }
        }
    }).then((result)=>{
        console.log(result.count + " records got deleted")
    })
} catch (e) {
    console.log("Cant check db for expired records")
    console.log(e)
    process.exit(1)
}