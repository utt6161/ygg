import user from "../../models/user.js"
import { createErrorPayload } from "../../utils/payloads.js"
import { parseUUID } from "../../utils/UUIDutils.js"
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { validationResult } from "express-validator"
import * as pngjs from 'pngjs'
const PNG = pngjs.PNG

function computeTextureHash(image) {
    const bufSize = 8192;
    let hash = crypto.createHash("sha256");
    let buf = Buffer.allocUnsafe(bufSize);
    let width = image.width;
    let height = image.height;
    buf.writeUInt32BE(width, 0);
    buf.writeUInt32BE(height, 4);
    let pos = 8;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let imgidx = (width * y + x) << 2;
            let alpha = image.data[imgidx + 3];
            buf.writeUInt8(alpha, pos + 0);
            if (alpha === 0) {
                buf.writeUInt8(0, pos + 1);
                buf.writeUInt8(0, pos + 2);
                buf.writeUInt8(0, pos + 3);
            } else {
                buf.writeUInt8(image.data[imgidx + 0], pos + 1);
                buf.writeUInt8(image.data[imgidx + 1], pos + 2);
                buf.writeUInt8(image.data[imgidx + 2], pos + 3);
            }
            pos += 4;
            if (pos === bufSize) {
                pos = 0;
                hash.update(buf);
            }
        }
    }
    if (pos > 0) {
        hash.update(buf.slice(0, pos));
    }
    return hash.digest("hex");
}


export default (req, res, next) => {
    console.log("texture gonna upload here")
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const bearer = req.header("Authorization").split(" ")[1]
    user.countDocuments({ accessToken: bearer }, function (err, count) {
        if (count > 0) {
            const type = req.params.textureType
            const image = PNG.sync.read(req.file.buffer)
            if (type === "skin") {
                if (!((image.height == 64 && image.width == 64) || (image.height == 64 && image.width == 32)) ||
                    req.file.size > 17000) {
                    return res.status(500).send(createErrorPayload(
                        "IllegalArgumentException",
                        "17kb max, 64x64 / 64x32 area"
                    ))
                }
            } else {
                if (!(image.height == 32 && image.width == 64) ||
                    (req.file.size > 17000)) {
                        return res.status(500).send(createErrorPayload(
                            "IllegalArgumentException",
                            "17kb max, 32x64 area"
                        ))
                } 
            }
            const imageName = computeTextureHash(image)

            fs.writeFileSync(path.resolve() + `/textures/${req.params.textureType}/${imageName}.png`, req.file.buffer)
            const textureQuery = {
                ...(type === "skin" ? 
                {
                    'skin.hash': imageName,
                    'skin.type': req.body.model ? req.body.model : "default",
                    'skin.url': `${process.env.HOST}/texture/${req.params.textureType}/${imageName}` 
                } : {
                    'cape.hash': imageName,
                    'cape.url': `${process.env.HOST}/texture/${req.params.textureType}/${imageName}` 
                })
            }
            user.updateOne({
                accessToken: bearer,
                uuid: parseUUID(req.params.uuid)
            }, {
                $set: textureQuery
            }, {
                new: false
            }, (err, user) => {
                if (err || !user) {
                    return res.status(500).send(createErrorPayload(
                        "ForbiddenOperation",
                        "No such user found"
                    ))
                } else {
                    return res.sendStatus(204)
                }
                
            })
        }
    })


}