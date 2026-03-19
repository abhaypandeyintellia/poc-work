import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
        required: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatarUrl: {
        type: String
    },
    password: {
        type: String,
        required: function () {
            return this.provider === "local";
        },
        select: false,
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
