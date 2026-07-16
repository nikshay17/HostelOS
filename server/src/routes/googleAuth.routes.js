const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const generateToken = require('../utils/generateToken');

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || '').replace(/\/+$/, '');

// Step 1: redirect user to Google's consent screen
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    // Always show Google's account chooser instead of silently reusing the
    // last signed-in Google account.
    prompt: 'select_account'
  })
);

// Step 2: Google redirects back here after user approves/denies
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err || !user) {
        const reason = info?.message || 'Google sign-in failed';
        return res.redirect(`${CLIENT_ORIGIN}/oauth-success?error=${encodeURIComponent(reason)}`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    res.redirect(`${CLIENT_ORIGIN}/oauth-success?token=${token}&role=${req.user.role}`);
  }
);

module.exports = router;
