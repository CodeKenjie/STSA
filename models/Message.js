const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classes",
        required: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    avatar: {
        type: String,
        deafault: "https://res.cloudinary.com/dlisxjo4c/image/upload/v1766812631/covers/wbqorjahphl9r4eoocq2.png",
        required: true
    },

    user: {
        type: String,
        required: true
    },
    
    email: {
        type: String,
        require: true
    },
    
    message: {
        type: String,
        required: true
    }
});

const Message = mongoose.model("Messages", messageSchema);

module.exports =  Message;