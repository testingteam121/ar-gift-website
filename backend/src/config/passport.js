const passport = require('passport');
const User = require('../models/User');

// Only register Google strategy if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'https://ar-gift-website.onrender.com'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const email = profile.emails?.[0]?.value;
            if (email) user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
              user.googleId = profile.id;
              user.authProvider = 'google';
              if (!user.avatar && profile.photos?.[0]?.value) user.avatar = profile.photos[0].value;
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName,
                email: (profile.emails?.[0]?.value || '').toLowerCase(),
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
                authProvider: 'google',
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
