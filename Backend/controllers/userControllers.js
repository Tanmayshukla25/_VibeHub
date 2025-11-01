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
      return res.status(400).json({ message: "Email and password are required" });
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
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    
    res
      .cookie("userToken", token, {
        httpOnly: true,       
        secure: true,         
        sameSite: "None",     
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

//userDob
// ✅ Update DOB Controller


// ✅ Update DOB Controller (Updated)
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
    const { id } = req.params;                 // expects :id route param
    const { bio } = req.body;

    console.log("User ID:", id);
    console.log("Bio:", bio);
    console.log("File object:", req.file);     // multer -> file info

    const updatedData = {};
    if (bio !== undefined) updatedData.bio = bio;
    if (req.file) {
  updatedData.profilePic = req.file.path || req.file.secure_url;
}

    const user = await User.findByIdAndUpdate(id, updatedData, { new: true }).select("email bio profilePic _id");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Profile updated successfully",
      user: { id: user._id, email: user.email, bio: user.bio, profilePic: user.profilePic }
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};