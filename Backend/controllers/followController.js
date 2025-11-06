import FollowRequest from "../models/FollowRequest.js";
import UserAuth from "../models/userSchema.js";


// ✅ Send Follow Request
export const sendFollowRequest = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const senderId = req.user.id; // make sure you get this from JWT middleware

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await FollowRequest.findOne({ sender: senderId, receiver: receiverId });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Request already sent" });
      } else if (existing.status === "accepted") {
        return res.status(400).json({ message: "You already follow this user" });
      }
    }

    const newRequest = new FollowRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    return res.status(200).json({ message: "Follow request sent", request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Accept Follow Request
export const acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    request.status = "accepted";
    await request.save();

    // Update both users
    await UserAuth.findByIdAndUpdate(request.sender, { $push: { following: request.receiver } });
    await UserAuth.findByIdAndUpdate(request.receiver, { $push: { followers: request.sender } });

    res.status(200).json({ message: "Follow request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Reject Follow Request
export const rejectFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Follow request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Fetch Pending Requests for a user (Notifications)
export const getFollowRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FollowRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "username profilePic name");

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
