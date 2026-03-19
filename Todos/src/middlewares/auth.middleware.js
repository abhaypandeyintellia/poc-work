import { ApiError } from "../utils/ApiError.js";

export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next(
            new ApiError({
                statusCode: 401,
                message: "Not authenticated",
            })
        );
    }

    return next();
};
