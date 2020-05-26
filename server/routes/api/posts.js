var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../../models/user");
const Post = require("../../models/posts");
const JobPost = require("../../models/JobPost");
const auth = require("../../middleware/auth");

// user = currently loggedIn user(Authenticated user)
// adding/creating a new post by user

router.post(
  "/",
  [auth, [check("text", "text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


//fetching all the posts

router.get("/all", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// fetching an individual post via post id

router.get("/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//deleting the individual post by the author(user) of the post.

router.delete("/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "not authorized" });
    }
    await post.remove();
    res.json({ msg: "post removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// fetching all the post which user has posted/creatd by himself

router.get("/myposts/:userId", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).sort();
    if (!posts) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// like the post by any user

router.get("/like/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(404).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Unlike the post if the user has already liked

router.put("/unlike/:postId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Adding a comment on any post by the user

router.post(
  "/comment/:postId",
  [auth, [check("text", "comment text cannot be empty").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(400).json({ msg: "no post found with ID" });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// deleting the individual comments by the comment author

router.delete("/comment/:postId/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (
      post.comments.filter(
        (comment) => comment._id.toString() === req.params.comment_id
      ).length === 0
    ) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    const removeIndex = post.comments
      .map((item) => item._id.toString())
      .indexOf(req.params.comment_id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// sharing any post by the user ; a new copy of the post will be created and also 
// the original post will be updated

router.post("/share/:postId/", auth, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ msg: "post does not exist" });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    let sharedpost = new Post({
      text: post.text,
      name: post.name,
      avatar: post.avatar,
      user: post.user,
    });
    post.shares.unshift({ user: req.user.id });
    sharedpost.sharedBy.push({ user: req.user.id });
    await post.save();
    await sharedpost.save();
    res.json(sharedpost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
