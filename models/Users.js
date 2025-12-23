const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  cover: {
    type: String,
    default: ""
  },

  avatar: {
    type: String,
    default:""
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
  }
}, { timestamps: true });

const User = mongoose.model('Users', userSchema);
module.exports = User;