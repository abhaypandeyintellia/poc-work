import { Router } from "express";
import { addUser, deleteUser, findAll, getMe, loginUser, logoutUser } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validations/user.schema.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import passport from "../config/passport.js";

const router = Router();

router.post("/", validate(registerSchema), addUser)
router.post("/login", loginUser)
router.get("/me", requireAuth, getMe)
router.post("/logout", requireAuth, logoutUser)
router.get("/", requireAuth, findAll)
router.delete("/:id", requireAuth, deleteUser)
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
        state: true
    })
);
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/api/user/google/failure",
        session: true
    }),
    (req, res) => {
        const redirectUrl = process.env.GOOGLE_SUCCESS_REDIRECT || process.env.CLIENT_ORIGIN || "http://localhost:3000";
        return res.redirect(redirectUrl);
    }
);
router.get("/google/failure", (_req, res) => {
    return res.status(401).json({ message: "Google authentication failed" });
});

export default router;
