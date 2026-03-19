import { toUserListResponseDto } from "../dtos/user.dto.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import { sendResponse } from "../utils/sendResponse.js";
import passport from "../config/passport.js";

export const addUser = async (req, res)  => {
    const {username, password} = req.body;

    if(!username || !password){
        throw new ApiError({
            statusCode: 400,
            message: "Fields required",
        });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        username,
        password: hashedPassword,
    });

    return sendResponse(res, {
        statusCode: 201,
        data: {
            username: user.username,
            createdAt: user.createdAt
        },
        message: "User profile created"
    });
}

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;

    if(!id){
        throw new ApiError({
            statusCode: 400,
            message: "User id missing",
        });
    }

    if(!username || !password){
        throw new ApiError({
            statusCode: 400,
            message: "Credentials missing"
        })
    }

    const user = await User.findById(id);

    if(!user){
        throw new ApiError({
            statusCode: 400,
            message: "Invalid User Id"
        });
    }

    const hashedPassword = user.password;

    const validated = await comparePassword(password, hashedPassword);

    if(user.username !== username || !validated){
        throw new ApiError({
            statusCode: 400,
            message: "Credentials mismatch"
        });
    }

    await User.findByIdAndDelete(id);

    return sendResponse(res,{
        statusCode: 200,
        message: "User deleted Successfully",
    })
    
}

export const findAll = async (req, res) => {
    const users = await User.find();

    return sendResponse(res, {
        statusCode: 200,
        message: "Users fetched Successfully",
        data: toUserListResponseDto(users)
    })
}

export const loginUser = (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) return next(err);

        if (!user) {
            return next(
                new ApiError({
                    statusCode: 401,
                    message: "Invalid username or password",
                })
            );
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) return next(loginErr);

            return sendResponse(res, {
                statusCode: 200,
                message: "Login successful",
                data: {
                    id: user._id,
                    username: user.username,
                    createdAt: user.createdAt,
                },
            });
        });
    })(req, res, next);
};

export const getMe = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next(
            new ApiError({
                statusCode: 401,
                message: "Not authenticated",
            })
        );
    }

    const user = req.user;
    return sendResponse(res, {
        statusCode: 200,
        message: "Session user",
        data: {
            id: user._id,
            username: user.username,
            createdAt: user.createdAt,
        },
    });
};

export const logoutUser = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next(
            new ApiError({
                statusCode: 401,
                message: "Not authenticated",
            })
        );
    }

    req.logout((err) => {
        if (err) return next(err);

        if (req.session) {
            req.session.destroy((destroyErr) => {
                if (destroyErr) return next(destroyErr);
                res.clearCookie("sid");
                return sendResponse(res, {
                    statusCode: 200,
                    message: "Logout successful",
                });
            });
            return;
        }

        return sendResponse(res, {
            statusCode: 200,
            message: "Logout successful",
        });
    });
};
