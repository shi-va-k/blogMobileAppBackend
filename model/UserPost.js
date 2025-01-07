const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  contentType: { type: String, required: true },
  caption: { type: String },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  posts: [{  
    imageUri: { type: String, required: true },  
    caption: { type: String, required: true },  
    uploadedAt: { type: Date, default: Date.now } 
  }],
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
