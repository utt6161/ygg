
import whitelist from "../../models/whitelist.js";


export default (req, res, next) => {
    whitelist.find({}, (err, value)=>{
        const users = []
        for(whitelisted of value){
            for await (const doc of user.find({ patreonId: whitelisted.patreonId })) {
                users.push(doc)
            }
        }
        if(users.length == 0) {
            return res.sendStatus(204)
        }
        return res.status(200).send(users)
    })
}