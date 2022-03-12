// Every minute     "0 * * ? * *"
// Every 12 hours   "0 0 */12 ? * *"

import user from './models/user.js';
import * as fs from 'fs'
import * as path from 'path'

fs.readdirSync(path.resolve() + "/textures/skin")
    .filter(fileName => fileName !== "steve")
    .forEach(fileName => {
        user.countDocuments({
            'skin.hash': fileName
        }, (err, count) => {
            if (count = 0) {
                fs.rmSync(path.resolve() + "/textures/skin/" + fileName)
            }
        })
    })

fs.readdirSync(path.resolve() + "/textures/skin")
    .forEach(fileName => {
        user.countDocuments({
            'cape.hash': fileName
        })
    }, (err, count) => {
        if (count = 0) {
            fs.rmSync(path.resolve() + "/textures/skin/" + fileName)
        }
    })