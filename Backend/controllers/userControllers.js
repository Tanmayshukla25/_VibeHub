import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//User Register

export const UserRegister = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      name,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error in UserRegister:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password field

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//User Login
export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res;
    res
      .cookie("userToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    console.error("Error in UserLogin:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const UserLogout = async (req, res) => {
  try {
    res
      .clearCookie("userToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in UserLogout:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update DOB Controller (Updated)
export const updateDOB = async (req, res) => {
  try {
    const { userId, day, month, year } = req.body;

    if (!userId || !day || !month || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
    const dob = new Date(year, monthIndex, day);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { dob },
      { new: true }
    ).select("email dob _id");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Date of birth updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        dob: updatedUser.dob,
      },
    });
  } catch (error) {
    console.error("Error updating DOB:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  console.log("✅ Reached updateProfile controller");
  try {
    const { id } = req.params;
    const { bio } = req.body;

    console.log("User ID:", id);
    console.log("Bio:", bio);
    console.log("File object:", req.file);

    const updatedData = {};
    if (bio !== undefined) updatedData.bio = bio;
    if (req.file) {
      updatedData.profilePic = req.file.path || req.file.secure_url;
    }

    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    }).select("email bio profilePic _id");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User Authenticated ✅",
    user: req.user, // user info comes from verifyToken middleware
  });
};


export const updateFullProfile = async (req, res) => {
  console.log("✅ Reached updateFullProfile controller");
  try {
    const { id } = req.params;
    const {
      name,
      username,
      email,
      bio,
      dob,
      website,
      isPrivate,
      password,
    } = req.body;

    console.log("User ID:", id);
    console.log("Request body:", req.body);
    console.log("File object:", req.file);

    // Create an object for only provided fields
    const updatedData = {};

    if (name) updatedData.name = name;
    if (username) updatedData.username = username;
    if (email) updatedData.email = email;
    if (bio) updatedData.bio = bio;
    if (dob) updatedData.dob = dob;
    if (website) updatedData.website = website;
    if (isPrivate !== undefined) updatedData.isPrivate = isPrivate;
    if (req.file) updatedData.profilePic = req.file.path || req.file.secure_url;

    // Hash password only if provided
    if (password) {
      const bcrypt = await import("bcrypt");
      const salt = await bcrypt.default.genSalt(10);
      updatedData.password = await bcrypt.default.hash(password, salt);
    }

    // If no fields were sent in the request
    if (Object.keys(updatedData).length === 0) {
      return res
        .status(400)
        .json({ message: "No fields provided to update." });
    }

    // Update and return the new user document
    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password -verificationCode -verificationCodeExpires");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully ✅",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
