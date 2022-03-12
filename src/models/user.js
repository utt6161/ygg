import moment from "moment";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: (name) =>
            (/^[a-zA-Z0-9_]{3,16}$/.test(name.replace(/ /g, '')) && (/^[a-zA-Z0-9]*_?[a-zA-Z0-9]*$/.test(name.replace(/ /g, '')))),
            message: props => `${props.value}: denied by name-policy `
        }
    },
    patreonId: {
        type: String,
        required: true
    },
    skin: {
        hash: {
            type: String,
            default: "steve"
        },
        type: {
            type: String,
            default: "default"
        },
        url: {
            type: String,
            default: `${process.env.HOST}/texture/skin/steve`
        }
    },
    uuid: {
        type: String,
        required: true
    },
    cape: {
        hash: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    accessToken: {
        type: String
    },
    clientToken: {
        type: String
    },
    serverId: {
        type: String
    },
    pending: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pending"
    },
    createdAt: {
        type: Date,
        default: moment().toDate()
    },
    expiresAt: {
        type: Date,
        default: moment().add(15, "days").toDate()
    }
});

export default mongoose.model("User", userSchema);
