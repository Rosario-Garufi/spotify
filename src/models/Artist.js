const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2019/08/27/21/05/guitar-4435313_1280.jpg"
    },
    genres: [
        {
            type: String,
            
        }
    ],
    followers: {
        type: Number,
        default: 0
    },
    albums: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album"
        }
    ],
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song"
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    
},

{
    timestamps : true
}
)

const Artist = mongoose.model("Artist", artistSchema)

module.exports = Artist