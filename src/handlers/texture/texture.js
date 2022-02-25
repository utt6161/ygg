import * as fs from 'fs';
import * as path from "path"

export default (req, res, next) => {
    
    const hash = req.params.hash
    const type = req.params.type
    const texturePath = path.resolve() + `/textures/${type}/${hash}.png`
    console.log(texturePath)
    if(fs.existsSync(texturePath)){
        res.sendFile(texturePath)
    } else {
        res.sendStatus(404)
    }
}