import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import { comparePassword } from "../utils/hashPassword.js";

passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username, provider: "local" }).select("+password");
        if (!user) return done(null, false);

        const isValid = await comparePassword(password, user.password);
        if (!isValid) return done(null, false);

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const avatarUrl = profile.photos?.[0]?.value;
        const displayName = profile.displayName || email || `google_${googleId}`;

        let user = await User.findOne({ googleId, provider: "google" });
        if (!user && email) {
          // Link by email if a local user exists with the same email.
          user = await User.findOne({ email });
        }

        if (!user) {
          user = await User.create({
            username: email || displayName,
            email,
            provider: "google",
            googleId,
            avatarUrl,
          });
        } else if (user.provider !== "google" || user.googleId !== googleId) {
          user.provider = "google";
          user.googleId = googleId;
          if (!user.email && email) user.email = email;
          if (avatarUrl) user.avatarUrl = avatarUrl;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
