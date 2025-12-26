const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moduleSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    progress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Module = mongoose.model("Modules", moduleSchema);
module.exports = Module;
