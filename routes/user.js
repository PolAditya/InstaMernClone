const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middelware/requireLogin");


// to get user profiles
router.get('/user/:id', async (req, res) => {
    try {
      const user = await USER.findOne({ _id: req.params.id }).select("-password");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const posts = await POST.find({ postedBy: req.params.id })
        .populate("postedBy", "_id userName Photo")
        .populate("comments.postedBy", "id userName");
      
      res.status(200).json({ user, posts });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
});



// to follow user
router.put("/follow", requireLogin, async (req, res) => {
  try {
    const followedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user.id },
      },
      { new: true }
    );

    await USER.findByIdAndUpdate(
      req.user.id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }
    );

    res.json(followedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// to unfollow
router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const unfollowedUser = await USER.findByIdAndUpdate(
      req.body.followId,
      {
        $pull: { followers: req.user.id },
      },
      { new: true }
    );

    await USER.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { following: req.body.followId },
      },
      { new: true }
    );

    res.json(unfollowedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});


// to upload profile pic
router.put("/uploadProfilePic", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.user.id,
      {
        $set: { Photo: req.body.pic },
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});



  
  

module.exports=router;