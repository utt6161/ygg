import Database from 'better-sqlite3';
export const db = (name)=> new Database(name);

export const ygg = db("./db/yggdrasil.db")
export const wl = db("./db/wl.db")