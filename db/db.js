import Database from 'better-sqlite3';

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const db = (name)=> new Database(name);

export const ygg = db("./db/yggdrasil.db")
export const wl = db("./db/wl.db")