const { request } = require("express")
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    password: {
        type: String,
        required: true,
    },
    mobile:{
        type: Number,
        required: true
    },
    savedPosts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Post', 
        },
      ],
      requests: [
        {
          from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          message: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
          },
        },
      ],
      friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }]
})

module.exports = mongoose.model('User', userSchema)