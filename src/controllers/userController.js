const User = require("../models/User");
const asyncHandler = require("express-async-handler")
const {StatusCodes} = require("http-status-codes");
const generateToken = require("../utils/generateToken");


//!desc - createUser
//methos POST
//route /api/v1/users

const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body


    if(!name || !email || !password){
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Name, email, password required!");
    }
    //check if the user exist
    const user = await User.findOne({email});
    if(user){
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("The user already exist!");
        
    }

    const newUser = await User.create({name, email, password, isAdmin: true})
    if(newUser){
        res.status(StatusCodes.CREATED).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            isAdmin: newUser.isAdmin
        })
    }else{
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Error signup");
        
    }
})

//!desc - Login
//methos POST
//route /api/v1/users
const loginUser = asyncHandler(async(req, res) => {
    const { email, password} = req.body
    if(!email || !password){
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Email, password is required");
        
    }

    //find the user
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.status(StatusCodes.OK).json({
            _id: user._is,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicture: user.profilePicture,
            token: generateToken(user._id)
        })
    }else{
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("Error credentials");
        
    }

   
})
//!desc - get user
//methos GET - private
//route /api/v1/users
const getUserProfile = asyncHandler(async(req, res) => {
    //find the user
    const user = await User.findById(req.user._id);
    if(user){
        res.status(StatusCodes.OK).json(user)
    }else {
        res.status(StatusCodes.BAD_REQUEST)
        throw new Error("User not found!");
        
    }
})


module.exports = {
    registerUser,
    loginUser,
    getUserProfile
}