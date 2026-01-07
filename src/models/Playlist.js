const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema.Types({
    name: {
        type: String,
        require: [true, "Playlist name is required"],
        trim: true
    },
    description: {
        type: String,
        trim:true
    },
    creaor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: [true, "The user is required"]
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
    timeStamps: true
})

const playlist = mongoose.model("Playlist", playlistSchema);
module.exports = playlist