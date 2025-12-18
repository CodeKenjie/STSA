const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
  age: Number,
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