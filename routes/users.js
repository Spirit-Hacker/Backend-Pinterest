const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pinterestClone");

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name:{
    type: String,
  },
  password: {
    type: String
  },
  profileImage:{
    type: String
  },
  contact: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  boards: {
    type: Array,
    default: [],
  },
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  }],
});

userSchema.plugin(plm);

// Create the User model
module.exports = mongoose.model('User', userSchema);

