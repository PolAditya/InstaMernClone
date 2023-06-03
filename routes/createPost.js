const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middelware/requireLogin");
const POST = mongoose.model("POST");

// Route

// to display all posts in home page
router.get("/allposts", requireLogin, (req, res)=> {
    POST.find()
    .populate("postedBy","id userName Photo")
    .populate("comments.postedBy", "id userName")
    .sort("-createdAt")
    .then(posts => res.json(posts))
    .catch(err => console.log(err));
})

// to display all posts posted by user in post gallery

router.get("/myposts", requireLogin, (req, res)=>{
    POST.find({postedBy:req.user.id})
    .populate("postedBy", "id userName")
    .populate("comments.postedBy", "id userName")
    .sort("-createdAt")
    .then(myposts=>res.json(myposts))
    .catch(err => console.log(err));
})

// to show following posts
router.get("/myfollowingpost", requireLogin, (req, res) => {
  POST.find({postedBy: {$in: req.user.following} })
    .populate("postedBy", "id userName")
    .populate("comments.postedBy", "id userName")
    .sort("-createdAt")
    .then(posts => {
      res.json(posts)
    })
    .catch(err => {console.log(err) })
})


// to Like posts
router.put("/like", requireLogin, async (req, res) => {
    try {
      const result = await POST.findByIdAndUpdate(
        req.body.postId,
        { $push: { likes: req.user.id } },
        { new: true }
      ).populate("postedBy","id userName Photo");
      res.json(result);
    } catch (error) {
      res.status(422).json({ error: error.message });
    }
  });

 
//  to dislike posts
router.put("/unlike", requireLogin, async (req, res) => {
  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.user.id } },
      { new: true }
    ).populate("postedBy","id userName Photo");
    res.json(result);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});


// to comment on post 
router.put("/comment", requireLogin, async(req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user.id 
  }

  try{
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {$push: {comments: comment}},
      {new: true}
    ).populate("comments.postedBy", "id userName")
    .populate("postedBy", "id, userName Photo");
    res.json(result);
  }catch(error){
    res.status(422).json({error: error.message});
  }

});




// to delete post
router.delete("/deletePost/:postId", requireLogin, async(req, res)=>{
  try{
    const post = await POST.findOne(
      {_id: req.params.postId}
    ).populate("postedBy", "id")
    if(!post){
      res.status(422).json({message: "post is not availabel"})
    }
    if(post.postedBy._id.toString() == req.user.id){
      post.deleteOne()
        .then(result => {
          return res.json({message: "Successfully Deleted"})
        })
    }
  }catch(error){
    res.status(422).json({error: error.message});
  }

});





// to create post and post it on instagram

router.post('/createPost', requireLogin, (req, res)=>{
    const { body, pic } = req.body;
    console.log(pic);
    if(!body || !pic){
        return res.status(422).json({
            error: "Please add all the fields"
        });
    }
    console.log(req.user + "from createPOst")

    const post = new POST({
        body,
        photo:pic,
        postedBy: req.user
    })

    post.save().then((result) => {
        return res.json({post: result})
    }).catch((err)=>console.log(err));

})




module.exports = router