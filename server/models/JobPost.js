const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobPostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  avatar: {
    type: String
  },
  JobTitle: {
    type: String,
    required: true,
  },
  postedBy: {
    type: String,
  },
  Jobdesc: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  RequiredExp: {
    type: Number,
    required: true,
    default:0
  },
  salary: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  skills: {
    type: [String],
  },
  applicants: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const JobPost = mongoose.model("JobPost", JobPostSchema);
module.exports = JobPost;
