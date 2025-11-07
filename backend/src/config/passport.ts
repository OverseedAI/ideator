import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { oauthLogin } from "../services/authService";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/v1/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials not configured. Social login will not work.");
}

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from Google profile
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "User";

        if (!email) {
          return done(new Error("No email provided by Google"), undefined);
        }

        // Calculate token expiration (typically 1 hour for Google)
        const expiresAt = new Date(Date.now() + 3600 * 1000);

        // Use the oauthLogin service to handle user creation/login/merging
        const result = await oauthLogin({
          provider: "google",
          providerId: profile.id,
          email,
          name,
          accessToken,
          refreshToken,
          expiresAt,
        });

        return done(null, result);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session (not used in JWT auth, but required by passport)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
