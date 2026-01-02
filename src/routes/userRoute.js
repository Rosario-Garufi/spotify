const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const { protectRoute } = require("../middlewares/authMiddleware");
 
const userRouter = express.Router();

//public
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)


//private
userRouter.get("/profile", protectRoute, getUserProfile)

module.exports = userRouter