const asyncHandler = require("express-async-handler");
const express = require("express");
const {StatusCodes} = require("http-status-codes");
const Playlist = require("../models/Playlist");
const uploadToCloudinary = require("../utils/cloudinaryUpdate");
const Song = require("../models/Song");
const User = require("../models/User");

//!DESC - CREATEPLAYLIST
// METHODS POST
//PRIVATE

const createPlaylist = asyncHandler(async(req, res) => {
    const {name, description, isPublic } = req.body;

    if(!name || !description){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Name and Description are required!");
        
    }

    //check is the playlist already exist for the user
    const playlist = await Playlist.findOne({name, creaor: req.user._id});
    if(playlist){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Playlist already exsist")
    }

    //if the user provide img
    let imageUrlPath = "";

    if(req.file){
        const result = await uploadToCloudinary(req.file?.path, "spotify/playlist");
        imageUrlPath = result.secure_url;
    }

    const newPlaylist = await Playlist.create({
        name,
        description,
        isPublic,
        coverImage : imageUrlPath ?? null,
        creator: req.user._id
    })
   

    res.status(StatusCodes.CREATED).json(newPlaylist);
})

//!DESC - GET PUBLIC PLAYLIST
//methods GET
//PUBLIC

const getPublicPlaylist = asyncHandler(async(req, res) => {
    const { search, page = 1, limit = 10} = req.query;
    
    //obj filtering
    const filter = {isPublic : true};
    if(search){
        filter.$or = [
            {name: {$regex: search, $options: "i"}},
            {description: {$regex: search, $options: "i"}}
        ]
    }

    const count = await Playlist.countDocuments(filter);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const playlists = await Playlist.find(filter).sort({followers: -1}).skip(parseInt(skip)).limit(parseInt(limit)).populate("creator", "name email profilePicture").populate("songs", "title audioUrl coverImage").populate("collaborators", "name email");

    res.status(StatusCodes.OK).json({
        playlists,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        totalPlaylists : count
    })
})


//!desc GetUserPlaylist
//methods GET
//private

const getUserPlaylist = asyncHandler(async(req, res) => {
    //find user or collaborators playlist
    const playlists = await Playlist.find({
        $or: [
            {
                creator: req.user._id
            },
            {collaborators: req.user._id}
        ]
    }).sort({createdAt: -1}).populate("creator", "name email profilePicture").populate("collaborators", "name email profilePicture").populate("songs", "title audioUrl coverImage ")

    res.status(StatusCodes.OK).json(playlists)
})

//!desc updatePlaylist
//methods PUT
//private

const updatePlaylist = asyncHandler(async(req, res) => {
    const {name, description, isPublic } = req.body;
    //find the playlist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found");
        
    }

    if(!playlist.creator.equals(req.user._id) && !playlist.collaborators.some((collab) => collab.equals(req.user._id))){
        res.status(StatusCodes.FORBIDDEN);
        throw new Error("Unoauthorized");
        
    }

    playlist.name = name ?? playlist.name;
    playlist.description = description ?? playlist.description;
    

    //only the creator can change state of the playlist ( public / private );
    if(isPublic && playlist.creator.equals(req.user._id)){
        playlist.isPublic = isPublic ?? playlist.isPublic
    }

    //if the user provide an image
    

    if(req.file){
       const result = await uploadToCloudinary(req.file?.path, "spotify/playlist");
       playlist.coverImage = result.secure_url
    }

    await playlist.save();
    res.status(StatusCodes.OK).json(playlist)
        
})

//!desc delete Playlist
//methods DELETE
//private - only creator
const deletePlaylist = asyncHandler(async(req, res) => {
    //find the playlist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found")
    }

    if(playlist.creator.equals(req.user._id)){
        //delete playlist from user follower playlist
        await User.updateMany(
            {followedArtist: playlist._id},
           {$pull : {followedArtist: playlist._id}} 
        )
        //delete playlist from playlist model
        await Playlist.findOneAndDelete({_id: req.params.id});
        res.status(StatusCodes.OK).json({
            message: "Playlist deleted successfull"
        })

    }else {
        res.status(StatusCodes.FORBIDDEN)
        throw new Error("Unouthorizard");
        
    }
})

//!desc add song to the playlist
//methods PUT
//private 

const addSongToPlaylist = asyncHandler(async(req, res) => {
    
    const {songIds} = req.body;

    //check if the playlist exist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found")
    }

    if(!playlist.creator.equals(req.user._id) && !playlist.collaborators.some((collab) => collab.equals(req.user._id))){
        res.status(StatusCodes.FORBIDDEN);
        throw new Error("You dont have permissione to add this song to playlist")
    }

    for(const songId of songIds){
        //check is have the song
        const song = await Song.findById(songId);
        if(!song){
            res.status(StatusCodes.NOT_FOUND);
            throw new Error("Song not found")
        }

        //check if the song already in the playlist
        if(playlist.songs.includes(songId)){
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("Song already in the playlist!");
        }
        //add song to playlist
        playlist.songs.push(songId)
        res.status(StatusCodes.OK).json(playlist)
    }

    await playlist.save()
})

//!desc remove song to the playlist
//methods PUT
//private 

const removeSongFromPlaylist = asyncHandler(async(req, res) =>  {
    const {songId} = req.body;
    //check if the playlist exist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Playlist not found");
    }
    if(!playlist.creator.equals(req.user._id) && !playlist.collaborators.some((collab) => collab.equals(req.user._id))){
        res.status(StatusCodes.FORBIDDEN);
        throw new Error("Unauthorized");
    }
    //check is the song exist
    const song = await Song.findById(songId);
    if(!song){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Song not found");
    }

    //check if the song is on the playlist
    if(!playlist.songs.some((song) => song.equals(songId))){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("Song is not in the playlist");
    }

    //delete song from playlist
    await Playlist.findOneAndUpdate(
       {_id: playlist._id},
        {$pull: {songs: songId}}
    )
    
    res.status(StatusCodes.OK).json({
        message: "The song has been removed from this playlist"
    })
})

//!desc add collaborator to playlist
//methods PUT
//private 

const addCollaboratorToPlaylist = asyncHandler(async(req, res) => {
    const {userIds} = req.body;

    //find the playlist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found")
    }

    //only creator can add/remove collaborators
    if(!playlist.creator.equals(req.user._id)){
        res.status(StatusCodes.FORBIDDEN);
        throw new Error("Unauthorized")
    }

    for(const userId of userIds){
        //check if the user exist
        const user = await User.findById(userId);
        if(!user){
            res.status(StatusCodes.NOT_FOUND);
            throw new Error("User not found")
        }

        //check if the user already a collaborator
        if(playlist.collaborators.some((id) => id.equals(userId))){
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("The user is already a collaborator")
        }
        playlist.collaborators.push(userId);
    }

    await playlist.save()
    res.status(StatusCodes.OK).json(playlist)
})

//!desc remove collaborator to playlist
//methods PUT
//private 

const removeCollaboratorFromPlaylist = asyncHandler(async(req,res) => {
    const {userId} = req.body;
    if(!userId){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("user is required")

    }

    //check is the playlist exist
    const playlist = await Playlist.findById(req.params.id);
    if(!playlist){
        res.status(StatusCodes.NOT_FOUND);
        throw new Error("Playlist not found")
    }

    //check if the user exist
    const user = await User.findById(userId);
    if(!user){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("User not exist")
    }

    //check is the user actually a collab
    if(!playlist.collaborators.some((collab) => collab.equals(userId))){
        res.status(StatusCodes.BAD_REQUEST);
        throw new Error("The user is not a collaborator")
    }

    playlist.collaborators = playlist.collaborators.filter(collabId => !collabId.equals(userId));
    await playlist.save();
    res.status(StatusCodes.OK).json({
        message: "The collaborator already removed"
    })
})

//!desc get feautured playlist
//methods GET
//public
const getFeaturedPlaylist = asyncHandler(async(req, res) => {
    const {limit = 5} = req.query;

    const filter = {isPublic : true};

    const playlist = await Playlist.find(filter).sort({followers: -1}).limit(parseInt(limit)).populate("creator", "name email profilePicture");

    res.status(StatusCodes.OK).json(playlist);
})
module.exports = {
    createPlaylist,
    getPublicPlaylist,
    getUserPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    addCollaboratorToPlaylist,
    removeCollaboratorFromPlaylist,
    getFeaturedPlaylist
}