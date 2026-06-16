import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { sendEmail } from '../services/emailService.js';
import { uploadFile } from '../services/cloudinaryService.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medconnect_jwt_super_secret_key_123456', {
    expiresIn: '30d',
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
      // Create empty patient details
      await Patient.create({
        userId: user._id,
        age: 18,
        bloodGroup: 'Unknown',
        emergencyContact: 'None',
        address: '',
      });
    } else if (user.role === 'Doctor') {
      // Create empty doctor details
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

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
    const emailHtml = `
      <h3>Welcome to MedConnect!</h3>
      <p>Hello ${user.name}, please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
    `;
    await sendEmail(user.email, 'Email Verification - MedConnect', emailHtml);

    res.status(201).json({
      message: 'Registration successful! Verification email sent.',
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
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

    let profileDetails = null;
    if (user.role === 'Patient') {
      profileDetails = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'Doctor') {
      profileDetails = await Doctor.findOne({ userId: user._id });
    }

    res.json({
      token: signToken(user._id),
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
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
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
    await sendEmail(user.email, 'Password Reset - MedConnect', emailHtml);

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
          availability: parsedDetails.availability, // Availability as JSON/Map representation
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
