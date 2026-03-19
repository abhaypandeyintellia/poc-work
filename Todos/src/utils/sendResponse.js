import { ApiResponse } from "./ApiResponse.js"

export const sendResponse = (
    res, {
        statusCode = 200, data = null, message
    }
) => {
    return res.status(statusCode)
    .json(new ApiResponse({
        statusCode, data, message
    }));
};