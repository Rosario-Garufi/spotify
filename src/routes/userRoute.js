const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, likedSong, followArtist, followPlaylist } = require("../controllers/userController");
const { protectRoute } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
 
const userRouter = express.Router();

//public
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)


//private
userRouter.get("/profile", protectRoute, getUserProfile)
userRouter.put("/liked-song", protectRoute, likedSong)
userRouter.put("/follow-artist", protectRoute, followArtist)
userRouter.put("/follow-playlist" ,protectRoute, followPlaylist)

userRouter.put("/profile", upload.single("profilePicture"), protectRoute, updateUserProfile)


module.exports = userRouter