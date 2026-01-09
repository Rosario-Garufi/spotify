const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Playlist name is required"],
        trim: true
    },
    description: {
        type: String,
        trim:true
    },
    creaor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "The user is required"]
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        }
    ],
    isPublic: {
        type: Boolean,
        default: false
    },
    followers: {
        type: Number,
        default: 0
    },
    coverImage: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2017/08/06/03/17/headphones-2588235_1280.jpg"
    },
    collaborators:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

}, {
    timestamps: true
})

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist