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
          return done(null, user);
        }

        // Check if user exists with this email
        const existingUser = await userModel.getByEmail(email);
        
        if (existingUser) {
          // Link Google account to existing user
          await userModel.linkGoogleAccount(existingUser._id!.toString(), id);
          return done(null, existingUser);
        }

        // Create new user
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 4);
        
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
