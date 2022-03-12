import moment from "moment";
import mongoose from "mongoose";


// upon creation starts a countdown till deletion

const pendingSchema = new mongoose.Schema({
    expiresAt: {
        type: Date,
        default: moment().add(45, 'seconds').toDate()
    },
})
pendingSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 } )

export default mongoose.model("Pending", pendingSchema);