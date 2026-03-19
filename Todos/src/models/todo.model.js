import mongoose, { Schema, model } from "mongoose";

const todoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Todo = model("Todo", todoSchema);

export default Todo;