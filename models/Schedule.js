const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schedSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Sched = mongoose.model("Schedules", schedSchema);
module.exports = Sched;