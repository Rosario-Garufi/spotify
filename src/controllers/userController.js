const User = require("../models/User");
const asyncHandler = require("express-async-handler")
const {StatusCodes} = require("http-status-codes");
const generateToken = require("../utils/generateToken");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const Playlist = require("../models/Playlist");


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

//!desc - liked song
//methos PUT - private
//route /api/v1/users

const likedSong = asyncHandler(async(req,res) => {
    const {songId} = req.body;
    //check if the song exist
    const song = await Song.findById(songId);
    if(!song){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Song not exist");
    }

    //find the user
    const user = await User.findById(req.user._id);
    if(!user){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("User not found!");
    }

    if(user.likedSongs.some((id) => id.equals(songId))){
        user.likedSongs = user.likedSongs.filter((id) => !id.equals(songId));
    }else{
        user.likedSongs.push(songId)
    }
    await user.save()
    res.status(StatusCodes.OK).json(user)
})

//!desc - Follow Artist
//methos PUT - private
//route /api/v1/users

const followArtist = asyncHandler(async(req,res) => {
    const  {artistId} = req.body;
    const userId = req.user._id
    //check if the artist exist
    const artist = await Artist.findById(artistId);
    if(!artist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("The artist not exist");
    }

    //find the user
    const user = await User.findById(userId);
    if(!user){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("User not found!")
    }

    const isFollowing = user.followedArtist.some((id) => id.equals(artistId));

    if(!isFollowing){
        //follow artist
        await Promise.all([
            User.updateOne(
                {_id: userId},
                {$addToSet: {followedArtist: artistId}}
            ),
            Artist.updateOne(
                {_id: artistId},
                {$inc: {followers: 1}}
            )
        ])
    }else{
        //UNFOLLOW
        await Promise.all([
            User.updateOne(
                {_id: userId},
                {$pull: {followedArtist: artistId}}
            ),
            Artist.updateOne(
                {_id: artistId},
                {$inc: {followers: -1}}
            )
        ])
    }

    res.status(StatusCodes.OK).json({
        message: isFollowing ? "Artist Unfollowed" : "Artist Followed"
    })
})


//!desc - Follow Playlist
//methos PUT - private
//route /api/v1/users

const followPlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.body;
    const userId = req.user._id

    //check if the user exist
    const user = await User.findById(userId)
      if(!user){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("User not found");
    }

    
    //check is the playlist exist
    const playlist = await Playlist.findById(playlistId);
    if(!playlistId){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found");
    }

    const isFollowing = user.followedPlaylist.some((id) => id.equals(playlistId));

    if(!isFollowing){
        await Promise.all([
            user.updateOne(
                {$addToSet: {followedPlaylist: playlistId}}
            ),
            playlist.updateOne(
                {$inc: {followers: 1}}
            )
        ])
    }else{
        await Promise.all([
            user.updateOne(
                {$pull : {followedPlaylist: playlistId}}
            ),
            playlist.updateOne(
                {$inc: {followers: -1}}
            )
        ])
    }

    res.status(StatusCodes.OK).json({
        message: isFollowing ? "Unfollow the playlist" : "Follow the playlist"
    })

})
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    likedSong,
    followArtist,
    followPlaylist
}