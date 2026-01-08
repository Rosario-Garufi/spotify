const asyncHandler = require("express-async-handler");
const {StatusCodes} = require("http-status-codes");


//!DESC - CREATESONG
// METHODS POST
//PRIVATE

const createSong = asyncHandler(async(req, res) => {
    console.log("create song")
})

module.exports = {
    createSong
}