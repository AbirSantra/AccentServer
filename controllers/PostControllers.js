//! This file contains all the controllers for the post actions routes
//? All routes begin with '/post'

import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import mongoose from "mongoose";

//! Creating a new post
export const createPost = async (req, res) => {
  const postDetails = req.body;

  const newPost = new postModel(postDetails);

  try {
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the post details from req.body
  2. Create a new post using the post model putting the post details
  3. Try to save it to the database.
  4. If successful, then send success message
  5. Else, send error message
  */
};

//! Update a post
export const updatePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId } = req.body;

  try {
    const prevPost = await postModel.findById(targetPostId);
    if (prevPost.userId === userId) {
      await prevPost.updateOne({ $set: req.body });
      res.status(200).json("Post Updated successfully!");
    } else {
      res
        .status(403)
        .json("Action forbidden! You can only update your own post!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the userId from the body
  3. Find the target post from the database using the target post id
  4. Check if the targetPost's userId field matches with the userId provided in the body
  5. If true, then that means the user is trying to update his own post which is acceptable
  6. Update the targetPost using updateOne() and $set the post to be req.body
  7. Send the success messsage.
  8. Else, it means the user is trying to update someone else's post which is not acceptable. So send error message.
  9. If any error, send error message.
  */
};

//! Delete post
export const deletePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId } = req.body;

  try {
    const post = await postModel.findById(targetPostId);

    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post successfully deleted!");
    } else {
      res
        .status(403)
        .json("Action forbidden! You can only delete your own post.");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /* 
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the post in the database using the target post id
  4. If the post.userId matches the current user id, then it means the user is trying to delete their own post which is acceptable
  5. Delete the post using deleteOne() and return success message
  6. Else the user is trying to delete someone else's post which is not acceptable. So send error message
  7. If any other error, send the error message
  */
};

//! Like/Unlike a Post
export const likePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId: currentUserId } = req.body;

  try {
    const post = await postModel.findById(targetPostId);

    if (!post.likes.includes(currentUserId)) {
      await post.updateOne({ $push: { likes: currentUserId } });
      res.status(200).json("Post liked successfully!");
    } else {
      await post.updateOne({ $pull: { likes: currentUserId } });
      res.status(200).json("Post unliked successfully!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the target post in the database using the target post id
  4. If the likes array of the post does not contain the current user id, then it means that the user wants to like the post.
  5. Push the current user id into the likes array of the target post using updateOne() and send success message
  6. Else if the likes array already contains the current user id, then it means that the user wants to dislike the post
  7. Pull the current user id from the likes array of the target post using updateOne() and send success message
  8. If any error, then return the error message
  */
};

//! Save a post
export const savePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId: currentUserId } = req.body;

  try {
    const currentUser = await userModel.findById(currentUserId);

    if (!currentUser.savedPosts.includes(targetPostId)) {
      await currentUser.updateOne({ $push: { savedPosts: targetPostId } });
      res.status(200).json("Post Saved!");
    } else {
      res.status(403).json("Post already saved by user!");
      // await currentUser.updateOne({ $pull: { savedPosts: targetPostId } });
      // res.status(200).json("Post Unliked!");
    }
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the current user in the database using the current user id
  4. If the savedPosts array of the user does not contain the target post id, then it means that the user wants to save the post.
  5. Push the target post id into the savedPosts array of the current user using updateOne() and send success message
  6. Else if the savedPosts array already contains the target post id, then return action forbidden since a user can only save a post once.
  7. If any error, then return the error message
  */
};

//! Unsave a post
export const unsavePost = async (req, res) => {
  const targetPostId = req.params.id;

  const { userId: currentUserId } = req.body;

  try {
    const currentUser = await userModel.findById(currentUserId);
    if (currentUser.savedPosts.includes(targetPostId)) {
      await currentUser.updateOne({ $pull: { savedPosts: targetPostId } });
      res.status(200).json("Post Unsaved!");
    } else {
      res.status(403).json("Post is not saved by user");
    }
  } catch (error) {
    res.status(500).json(error);
  }
  /*
  1. Get the target post id from the params
  2. Get the current user id from the body
  3. Find the current user in the database using the current user id
  4. If the savedPosts array of the user contains the target post id, then it means that the user wants to unsave the post.
  5. Pull the target post id from the savedPosts array of the current user using updateOne() and send success message
  6. Else if the savedPosts array already does not contain the target post id, then it means that the user wants to unsave the post which was not saved in the first place. Return action forbidden.
  7. If any error, then return the error message
  */
};

//! Get a post
export const getPost = async (req, res) => {
  const targetPostId = req.params.id;

  try {
    const targetPost = await postModel.findById(targetPostId);
    res.status(200).json(targetPost);
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the target post id from the params
  2. Find the post in the database using the target post id
  3. Return the post
  4. If any error, send error message
  */
};

//! Get Following Posts
export const getFollowingPosts = async (req, res) => {
  const currentUserId = req.params.id;

  try {
    const currentUserPosts = await postModel.find({ userId: currentUserId });

    const followingUserPosts = await userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(currentUserId),
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "following",
          foreignField: "userId",
          as: "followingUserPosts",
        },
      },
      {
        $project: {
          followingUserPosts: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(
      currentUserPosts
        .concat(...followingUserPosts[0].followingUserPosts)
        .sort((a, b) => {
          return b.createdAt - a.createdAt;
        })
    );
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. This request will get all the posts by the followings of the current user as well as his own posts
  2. Get the current user id from the params.
  3. Get all the posts by the current user from the post model using find({userId: currentUserId})
  4. Get all posts which belong to the users in the followings array of the current user using the userModel
  5. To get all the posts from different sources we need to setup an aggregation pipeline
  6. The $match stage allows us to choose just those documents from a collection that we want to work with. It does this by filtering out those that do not follow our requirements. Here, our requirements are that we only need the posts for the current user. So we match the _id with the currentUserId by converting it into mongoose object id format.
  7. The $lookup stage allows us to merge fields from two different collections (here, the userModel and postModel). We specify the collection from where we need the documents (here, the 'posts' collection), then we specify the localfield (here, the "following" since we need to get the posts belonging to the following users only), then we specify the foreignfield with which we need to merge (here, the 'userId' since we need to match the users from the 'followings' array of the user with the 'userId' of the post).
  8. The $project stage allows us to define how we want our results back. Here we specify that we need the results as 'followingUserPosts' and we do not need the _id field
  9. Now we concat the current users posts with the following users posts and then sort them by the date of creation in descending order and return the result
  10. If any error, return the error message.
  */
};

//! Get the saved Posts of a user
export const getSavedPosts = async (req, res) => {
  const currentUserId = req.params.id;

  try {
    const currentUser = await userModel.findById(currentUserId);

    const savedPosts = await Promise.all(
      currentUser.savedPosts.map((postId) => {
        return postModel.findById(postId);
      })
    );

    res.status(200).json(savedPosts);
  } catch (error) {
    res.status(500).json(error);
  }

  /* 
  1. Get the current users id from the params
  2. Get the current users details using the id.
  3. Create a savedPosts array by mapping through the savedPosts array of the current user.
  4. Map through the array and for each post id present in the array, get the respective post from the post model.
  5. On success, return the savedPosts array
  6. On Failure, return the error message.
  */
};

//! Get Newest Posts
export const getNewestPosts = async (req, res) => {
  try {
    const newestPosts = await postModel.aggregate([
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json(newestPosts);
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get all the posts from the post model using the aggregate method.
  2. Sort the posts in descending order using $sort stage by the 'createdAt' field
  3. Return the posts and success message
  4. If any error then return error message
  */
};

//! Get most Popular Posts
export const getPopularPosts = async (req, res) => {
  try {
    const popularPosts = await postModel.aggregate([
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: { likesCount: -1 } },
    ]);
    res.status(200).json(popularPosts);
  } catch (error) {
    res.status(500).json(error);
  }

  /*
  1. Get the most popular posts using the aggregate function
  2. Add the field likesCount to the post using the $addFields stage
  3. Sort the posts using the 'likesCount' field and return
  4. If any error, return the error message.
  */
};
