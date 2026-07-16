const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@pec.edu.in';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value.toLowerCase();

      // Domain check — reject ANY email not ending in the allowed college domain
      if (!email.endsWith(ALLOWED_DOMAIN.toLowerCase())) {
        return done(null, false, { message: `Only ${ALLOWED_DOMAIN} accounts are allowed` });
      }

      let user = await User.findOne({ email });

      if (!user) {
        // First-time Google sign-in — auto-create a student account
        // No password needed since they'll always sign in via Google
        user = await User.create({
          name: profile.displayName,
          email,
          password: 'GOOGLE_OAUTH_NO_PASSWORD', // placeholder, never used for login
          role: 'student',
          studentId: `PENDING-${Date.now()}`, // student must complete profile later
          status: 'active', // Google's own verification IS our identity proof — no OTP needed
          authProvider: 'google',
          profileComplete: false,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;