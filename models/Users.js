const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  cover: {
    type: String,
    default: "https://res.cloudinary.com/dlisxjo4c/image/upload/v1766812631/covers/wbqorjahphl9r4eoocq2.png",
    required: true
  },

  avatar: {
    type: String,
    default:"https://res.cloudinary.com/dlisxjo4c/image/upload/v1766806280/avatars/jt8o0k5nhkzhf7actu1e.png",
    required: true
  },
  
  username:{
    type: String,
    required: true,
    unique: true
  },

  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true,
  },
  birthdate: String,
  school: String,
  year: String,
  course: String,
  verified: {
    type: Boolean,
    default: false,
  },

  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classes"
  }],
  
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const User = mongoose.model('Users', userSchema);
module.exports = User;