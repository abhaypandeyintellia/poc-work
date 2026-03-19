import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import Todo from "../models/todo.model.js";
import { sendResponse } from "../utils/sendResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


export const addTodo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;

    if(!title) {
        throw new ApiError({ statusCode: 400, message: "Fields Missing" });
    }

    const todo = await Todo.create({
        title,
        description: description ? description : "",
        userId: req.user.id
    });

    const savedTodo = await Todo.findById(todo._id)
    .populate("userId", "username createdAt");

    return sendResponse(res, {
        statusCode: 201,
        message: "Todo added successfully",
        data: savedTodo
    })

});


export const getAllTodo = asyncHandler(async (req, res) => {
    const todos = await Todo.find({ userId: req.user.id }).populate("userId", "username createdAt");

    return sendResponse(res, {
        statusCode: 200,
        message: "Todos fetched successfully",
        data: todos
    })
});

export const getById = asyncHandler(async (req, res) => {
    const {id} = req.params;

    if(!id) {
        throw new ApiError({
        statusCode: 400,
        message: "Id missing"
    });
}

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError({
        statusCode: 400,
        message: "Id invalid"
    });
    }

    const todo = await Todo.findOne({ _id: id, userId: req.user.id });

    if(!todo){
        throw new ApiError({
        statusCode: 400,
        message: "todo not found"
    });
    }

    return sendResponse(res, {
        statusCode: 200,
        message: "Todo found",
        data: todo
    })
});

export const deleteTodo = asyncHandler(async (req, res) => {
    const {id} = req.params;

    if(!id) {
        throw new ApiError({
        statusCode: 400,
        message: "Id missing"
    });
}

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError({
        statusCode: 400,
        message: "Id invalid"
    });
    }

    const deletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.user.id });

    if(!deletedTodo){
        throw new ApiError({
            statusCode: 404,
            message: "Todo not found"
        });
    }

    return sendResponse(res, {
        statusCode: 200,
        message: "todo deleted successfully"
    })
});


export const updateTodo = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {title, description} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError({
            statusCode: 400,
            message: "Invalid todoId"
        });
    }

    const oldTodo = await Todo.findOne({ _id: id, userId: req.user.id });

    if(!oldTodo){
        throw new ApiError({
            statusCode: 400,
            message: "Todo not found"
        });
    }

    const newTodo = await Todo.findOneAndUpdate({ _id: id, userId: req.user.id }, {
        title,
        description: description ? description : "",
        userId: req.user.id
    }, {new: true});

    if(!newTodo){
        throw new ApiError({
            statusCode: 400,
            message: "Couldn't update todo"
        });
    }

    return sendResponse(res, {
        statusCode: 200,
        data: newTodo,
        message: "Todo updated successfully"
    })
});

export const getUserTodo = asyncHandler(async (req, res) => {
    const userTodos = await Todo.find({userId: req.user.id});

    return sendResponse(res, {
        statusCode: 200,
        message: "User todo fetched",
        data: userTodos
    });
});
