const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/userController");
const { protectRoute } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
 
const userRouter = express.Router();

//public
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)


//private
userRouter.get("/profile", protectRoute, getUserProfile)
userRouter.put("/profile", upload.single("profilePicture"), protectRoute, updateUserProfile)


module.exports = userRouter