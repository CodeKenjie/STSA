const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    completed: {
        type: Boolean,
        default: false
    },

    due: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ToDo = mongoose.model("Todos", todoSchema);
module.exports = ToDo;