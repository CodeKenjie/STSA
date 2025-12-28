const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema({
    class_name: {
        type: String,
        required: true
    },

    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }]
});

const Class = mongoose.model("Classes", classSchema);
module.exports = Class;
