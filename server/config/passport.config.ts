import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.models";
import { generateToken } from "../utils/jwt.utils";

const userModel = new UserModel();

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, emails, name, photos } = profile;
        const email = emails?.[0]?.value;
        const displayName = `${name?.givenName} ${name?.familyName}`.trim();
        const profilePicture = photos?.[0]?.value;

        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        // Check if user already exists with this Google ID
        let user = await userModel.getByGoogleId(id);
        
        if (user) {
          // Check if account is deleted
          if (user.deletedAt) {
            return done(new Error("This account has been deleted"), undefined);
          }
          return done(null, user);
        }

        // Check if user exists with this email (including deleted accounts)
        const { User } = await import("../schema/user.schema");
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
          // Check if account is deleted
          if (existingUser.deletedAt) {
            return done(new Error("This account has been deleted"), undefined);
          }
          // Link Google account to existing user
          await userModel.linkGoogleAccount(existingUser._id!.toString(), id);
          return done(null, existingUser);
        }

        // Create new user
        // Generate username from email prefix, sanitize invalid characters
        const emailPrefix = email.split('@')[0];
        // Replace dots and any other non-alphanumeric characters (except underscore) with underscores
        const sanitizedPrefix = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_');
        // Generate unique username with random suffix
        let username = sanitizedPrefix + '_' + Math.random().toString(36).substr(2, 4);
        
        // Ensure username is unique (in case of collision)
        let existingUsername = await userModel.getByUsername(username);
        let attempts = 0;
        while (existingUsername && attempts < 10) {
          username = sanitizedPrefix + '_' + Math.random().toString(36).substr(2, 4);
          existingUsername = await userModel.getByUsername(username);
          attempts++;
        }
        
        user = await userModel.createGoogleUser({
          email,
          name: displayName,
          username,
          googleId: id,
          profilePicture,
          isEmailVerified: true, 
          isVerified: true,
        });

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, undefined);
      }
    }
  )
);


passport.serializeUser((user: any, done) => {
  done(null, user._id.toString());
});


passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.getById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
