const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {StatusCodes} = require("http-status-codes");

const protectRoute = asyncHandler(async(req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            token = req.headers.authorization.split(" ")[1];
            //verify token
            const decoded = jwt.verify(token, process.env.JWT);
            req.user = await User.findById(decoded.id).select("-password")
            next()
        } catch (error) {
           throw new Error("Invalid Token!");
           
        }
    }else{
        res.status(StatusCodes.UNAUTHORIZED)
        throw new Error("You dont have permission");
        
    }
})

const isAdmin = asyncHandler(async(req, res, next) => {
    
    if(req.user && req.user.isAdmin){
        next()
    }else{
        res.status(StatusCodes.FORBIDDEN)
        throw new Error("You not have the permission to do that")
    }
})

module.exports = {
    protectRoute,
    isAdmin
}