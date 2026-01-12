const User = require("../models/User");
const asyncHandler = require("express-async-handler")
const {StatusCodes} = require("http-status-codes");
const generateToken = require("../utils/generateToken");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");


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
            _id: user._id,
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

const updateUserProfile = asyncHandler(async(req, res) => {
        const {name, email, password} = req.body;
        const user = await User.findById(req.user._id);
        if(user){
            user.name = name || user.name;
            user.email = email || user.email;

            if(password){
                user.password = password;
            }

            //upload profilePicture if the user providr
            if(req.file){
                const result = await uploadToCloudinary(req.file.path, "spotify/users");
                user.profilePicture = result.secure_url || user.profilePicture
            }

            const updateUser = await user.save();
            res.status(StatusCodes.OK).json({
                _id : updateUser._id,
                name: updateUser.name,
                email: updateUser.email,
                isAdmin: updateUser.isAdmin,
                profilePicture: updateUser.profilePicture
            })
        }else{
            res.status(StatusCodes.NOT_FOUND)
            throw new Error("User not found");
            
        }

})

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}