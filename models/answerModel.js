const mongoose = require("mongoose");

// student answer and we can knowm,who is the sender of answers
const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },

 assignmentLink: {
    type: String,
  },
  path: {
    type: String,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Task",
  },

  isSend: {
    type: Boolean,
    default: false,
  },
  isViewed: {
    type: Boolean,
    default: false,
  },
  status:{type:String , require:true,  
          default:'Not Sent', 
          enum:['Excellent','Good','Not Bad','Failed','Pending','Sent','Not Sent']},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Answer", answerSchema);
