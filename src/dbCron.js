// import { ygg } from "./db/db.js"

// Every minute     "0 * * ? * *"
// Every 12 hours   "0 0 */12 ? * *"


// mongoose version will be later
import Prisma from '@prisma/client'
const { PrismaClient } = Prisma
const prisma = new PrismaClient()

console.log("Checking for any expiried tokens")
try {
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