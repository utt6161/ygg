import user from "../../models/user.js"

export default (req, res, next) => {
    const bearer = req.header("Authorization").split(" ")[1]
    console.log(bearer)
    user.countDocuments({accessToken: bearer}, function (err, count){ 
        if(count>0){
            return res.status(200).send(
                {
                    "privileges": {
                      "onlineChat": {
                        "enabled": true
                      },
                      "multiplayerServer": {
                        "enabled": true
                      },
                      "multiplayerRealms": {
                        "enabled": false
                      },
                      "telemetry": {
                        "enabled": false
                      }
                    },
                    "profanityFilterPreferences": {
                      "profanityFilterOn": false
                    }
                  }
            )
        } else {
            res.sendStatus(404)
        }
    }); 
}