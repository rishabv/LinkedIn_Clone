var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/user");
const Post = require("../../models/posts");
const JobPost = require("../../models/JobPost");
const auth = require("../../middleware/auth");

// Adding a new jobpost by the user

router.post(
  "/addlisting",
  [
    auth,
    [
      check("JobTitle", "title shoudl not be empty").not().isEmpty(),
      check("Jobdesc", "descripton shoudl not be empty").not().isEmpty(),
      check("company", "company shoudl not be empty").not().isEmpty(),
      check("location", "location shoudl not be empty").not().isEmpty(),
      check("RequiredExp", "RequiredExp shoudl not be empty").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newjobpost = new JobPost({
        JobTitle: req.body.JobTitle,
        Jobdesc: req.body.Jobdesc,
        company: req.body.company,
        skills: req.body.skills,
        location: req.body.location,
        RequiredExp: req.body.RequiredExp,
        postedBy: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      //   if (skills) {
      //     skills.split(",").map((skill) => skill.trim());
      //   }
      const jobpost = await newjobpost.save();
      res.json(jobpost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// fetching all the job listings by all users

router.get("/all_listings", async (req, res) => {
  try {
    const jobpost = await JobPost.find();
    if (!jobpost) {
      return res.status(400).json({ msg: "no job post found" });
    }
    res.json(jobpost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// fetching a single jobpost via jobpostId

router.get("/:jobpostId", auth, async (req, res) => {
  try {
    const jobpost = await JobPost.findById(req.params.jobpostId);
    if (!jobpost) {
      return res.status(404).json({ msg: "jobpost not found" });
    }
    res.json(jobpost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// deleting the jobpost by the author only

router.delete("/:jobpostId", auth, async (req, res) => {
  try {
    const jobpost = await JobPost.findById(req.params.jobpostId);
    if (jobpost.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "not authorized" });
    }
    await jobpost.remove();
    res.json({ msg: "jobpost removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// fetching all the job listings posted by the user

router.get("/mylistings/:userId", auth, async (req, res) => {
  try {
    const jobposts = await JobPost.find({ user: req.params.userId });
    if (!jobposts) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(jobposts);
    console.log(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Applying to a job post by user

router.get("/apply/:jobpostId", auth, async (req, res) => {
  try {
    const jobpost = await JobPost.findById(req.params.jobpostId);
    if (
      jobpost.applicants.filter(
        (applicant) => applicant.user.toString() === req.user.id
      ).length > 0
    ) {
      return res.status(404).json({ msg: "already applied" });
    }
    jobpost.applicants.unshift({ user: req.user.id });
    await jobpost.save();
    res.json(jobpost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
