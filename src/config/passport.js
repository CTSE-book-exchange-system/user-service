const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/userModel');

const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

const inferUniversity = (email = '') => {
  const domain = email.split('@')[1]?.toLowerCase() || '';

  if (domain.includes('sliit')) {
    return 'SLIIT';
  }

  if (domain.includes('nsbm')) {
    return 'NSBM';
  }

  if (domain.includes('iit')) {
    return 'IIT';
  }

  if (domain.includes('mora')) {
    return 'University of Moratuwa';
  }

  return process.env.GOOGLE_DEFAULT_UNIVERSITY || 'Unknown';
};

if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error('Google account did not provide an email address'));
          }

          const user = await userModel.findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName || 'Google User',
            university: inferUniversity(email),
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

module.exports = { passport, isGoogleOAuthConfigured };
