import user from "../../models/user.js";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(`got some validation errors`)
        console.log(errors)
        return res.status(500).send(errors.array()[0].msg)
    }
    const bearer = req.header("Authorization").split(" ")[1]
    const textureQuery = {
        ...(type === "skin" ? 
        {
            'skin.hash': "steve",
            'skin.type': "default",
            'skin.url': `${process.env.HOST}/texture/skin/steve`
        } : {
            'cape.hash': null,
            'cape.url': null 
        })
    }
    user.updateOne({
        accessToken: bearer,
        uuid: parseUUID(req.params.uuid)
    }, {
        $set: textureQuery
    }, {
        new: true
    }, (err, user) => {
        if(err || !user) {
            return res.status(500).send(createErrorPayload(
                "ForbiddenOperation",
                "No such user found"
            ))
        }
    })
}