import mongoose from "mongoose"

const whitelistSchema = new mongoose.Schema({
    patreonId: {
        type: String,
        required: true
    }
})

export default mongoose.model("Whitelist", whitelistSchema);