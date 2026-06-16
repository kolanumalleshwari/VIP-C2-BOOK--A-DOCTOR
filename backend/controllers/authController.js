import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { sendEmail } from '../services/emailService.js';
import { uploadFile } from '../services/cloudinaryService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medconnect_jwt_super_secret_key_123456';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'medconnect_refresh_super_secret_key_789012';

// Access Token expires in 15m
const signAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
};

// Refresh Token expires in 7d
const signRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Cookie Options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Send Tokens response helper
const sendTokensResponse = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Save refresh token to DB
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  let profileDetails = null;
  if (user.role === 'Patient') {
    profileDetails = await Patient.findOne({ userId: user._id });
  } else if (user.role === 'Doctor') {
    profileDetails = await Doctor.findOne({ userId: user._id });
  }

  res.status(statusCode).json({
    accessToken,
    refreshToken, // Return in body as fallback
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      profileDetails,
    },
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password, role, phone, gender } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Patient',
      phone,
      gender,
      verificationToken,
    });

    if (user.role === 'Patient') {
      await Patient.create({
        userId: user._id,
        age: 18,
        bloodGroup: 'Unknown',
        emergencyContact: 'None',
        address: '',
      });
    } else if (user.role === 'Doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: 'General',
        qualification: 'MBBS',
        experience: 0,
        consultationFee: 500,
        hospitalName: 'General Hospital',
        clinicAddress: 'Pending Onboarding',
        approved: false,
      });
    }

    // Send verification email (mocked if credentials missing)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const emailHtml = `
      <h3>Welcome to MediConnect Pro™!</h3>
      <p>Hello ${user.name}, please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
    `;
    await sendEmail(user.email, 'Email Verification - MediConnect Pro™', emailHtml);

    await sendTokensResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await sendTokensResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Logout user & clear tokens
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    res.clearCookie('refreshToken', cookieOptions);
    return res.status(204).json({ message: 'No content' });
  }

  try {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      // Remove token from list
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
    }
  } catch (error) {
    console.error('Logout error:', error.message);
  }

  res.clearCookie('refreshToken', cookieOptions);
  return res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Refresh access token (Rotation)
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    // Find user with this refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });

    // Detect refresh token reuse / hacking attempt
    if (!user) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        // Token was valid but user wasn't found - indicates reuse/theft of this token.
        // Invalidate all tokens for safety.
        const compromisedUser = await User.findById(decoded.id);
        if (compromisedUser) {
          compromisedUser.refreshTokens = [];
          await compromisedUser.save();
        }
      } catch (err) {
        // Token was invalid anyway, do nothing
      }
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(403).json({ message: 'Forbidden: Invalidation triggered' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      // Expired token, remove from DB
      user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
      res.clearCookie('refreshToken', cookieOptions);
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Remove the old used refresh token
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);

    // Generate new pair
    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    // Save new refresh token
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set new cookie
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).send('<h1>Verification token invalid or expired</h1>');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('<h1>Email Verified Successfully! You may now log in to the application.</h1>');
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).send('<h1>Server error during verification</h1>');
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    const emailHtml = `
      <h3>Reset Password Requested</h3>
      <p>Please click the link below to set a new password. This link expires in 10 minutes:</p>
      <a href="${resetUrl}" target="_blank">Reset Password Link</a>
    `;
    await sendEmail(user.email, 'Password Reset - MediConnect Pro™', emailHtml);

    res.json({ message: 'Password reset link sent to email!' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error during forgot password process' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// @desc    Change Password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// @desc    Get current user profile details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileDetails = null;
    if (user.role === 'Patient') {
      profileDetails = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'Doctor') {
      profileDetails = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        profileDetails,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error loading profile' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, gender, patientDetails, doctorDetails } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    // Handle image file upload
    if (req.file) {
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = await uploadFile(req.file.path, serverBaseUrl);
      user.profileImage = imageUrl;
    }

    await user.save();

    let updatedProfileDetails = null;
    if (user.role === 'Patient' && patientDetails) {
      const parsedDetails = typeof patientDetails === 'string' ? JSON.parse(patientDetails) : patientDetails;
      updatedProfileDetails = await Patient.findOneAndUpdate(
        { userId: user._id },
        {
          age: parsedDetails.age,
          bloodGroup: parsedDetails.bloodGroup,
          emergencyContact: parsedDetails.emergencyContact,
          address: parsedDetails.address,
        },
        { new: true, upsert: true }
      );
    } else if (user.role === 'Doctor' && doctorDetails) {
      const parsedDetails = typeof doctorDetails === 'string' ? JSON.parse(doctorDetails) : doctorDetails;
      updatedProfileDetails = await Doctor.findOneAndUpdate(
        { userId: user._id },
        {
          specialization: parsedDetails.specialization,
          qualification: parsedDetails.qualification,
          experience: parsedDetails.experience,
          consultationFee: parsedDetails.consultationFee,
          hospitalName: parsedDetails.hospitalName,
          clinicAddress: parsedDetails.clinicAddress,
          availability: parsedDetails.availability,
          bio: parsedDetails.bio,
          about: parsedDetails.about,
          languages: parsedDetails.languages,
          certifications: parsedDetails.certifications,
          consultationMethods: parsedDetails.consultationMethods,
        },
        { new: true, upsert: true }
      );
    } else {
      if (user.role === 'Patient') {
        updatedProfileDetails = await Patient.findOne({ userId: user._id });
      } else if (user.role === 'Doctor') {
        updatedProfileDetails = await Doctor.findOne({ userId: user._id });
      }
    }

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        profileDetails: updatedProfileDetails,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating profile details' });
  }
};
