const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const { register, login, getMe, adminLogin, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ar-gift-website.vercel.app';

// Standard auth
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = req.user.generateToken();
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar || '',
    }));
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${user}`);
  }
);

module.exports = router;
