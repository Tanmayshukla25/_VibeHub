import FollowRequest from "../models/FollowRequest.js";
import UserAuth from "../models/userSchema.js";

// export const sendFollowRequest = async (req, res) => {
//   try {
//     const receiverId = req.params.receiverId;
//     const senderId = req.user.id;

//     const existing = await FollowRequest.findOne({ sender: senderId, receiver: receiverId });
//     if (existing) {
//       return res.status(400).json({ message: "Request already sent or user already followed" });
//     }

//     const newRequest = new FollowRequest({ sender: senderId, receiver: receiverId });
//     await newRequest.save();
//     return res.status(200).json({ message: "Follow request sent", request: newRequest });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const sendFollowRequest = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // ✅ Check if request already exists (pending)
    const existingRequest = await FollowRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // ✅ Check if sender already follows receiver
    const senderUser = await UserAuth.findById(senderId);
    if (senderUser.following.includes(receiverId)) {
      return res.status(400).json({ message: "You already follow this user" });
    }

    // ✅ Check if receiver already sent a request to sender (follow back case)
    const reverseRequest = await FollowRequest.findOne({
      sender: receiverId,
      receiver: senderId,
      status: "pending",
    });

    if (reverseRequest) {
      // 🟡 If receiver already sent a request to sender → mark as mutual accepted
      reverseRequest.status = "accepted";
      await reverseRequest.save();

      await UserAuth.findByIdAndUpdate(senderId, { $push: { following: receiverId } });
      await UserAuth.findByIdAndUpdate(receiverId, { $push: { followers: senderId } });

      return res.status(200).json({ message: "Request accepted (mutual follow established)" });
    }

    // ✅ Create new follow request
    const newRequest = new FollowRequest({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await newRequest.save();

    res.status(200).json({ message: "Follow request sent", request: newRequest });
  } catch (err) {
    console.error("Error in sendFollowRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// export const acceptFollowRequest = async (req, res) => {
//   try {
//     const requestId = req.params.requestId;
//     const request = await FollowRequest.findById(requestId);
//     if (!request || request.status !== "pending") {
//       return res.status(404).json({ message: "Request not found or already handled" });
//     }

//     request.status = "accepted";
//     await request.save();

//     await UserAuth.findByIdAndUpdate(request.sender, { $push: { following: request.receiver } });
//     await UserAuth.findByIdAndUpdate(request.receiver, { $push: { followers: request.sender } });

//     res.status(200).json({ message: "Follow request accepted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    request.status = "accepted";
    await request.save();

    // ✅ Create mutual follow
    await UserAuth.findByIdAndUpdate(request.sender, { $push: { following: request.receiver } });
    await UserAuth.findByIdAndUpdate(request.receiver, { $push: { followers: request.sender } });

    res.status(200).json({ message: "Follow request accepted successfully" });
  } catch (err) {
    console.error("Error in acceptFollowRequest:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Follow request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FollowRequest.find({ receiver: userId, status: "pending" })
      .populate("sender", "username name profilePic");

    res.status(200).json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const cancelFollowRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    await FollowRequest.findOneAndDelete({ sender: senderId, receiver: receiverId, status: "pending" });

    res.status(200).json({ message: "Follow request cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    await UserAuth.findByIdAndUpdate(senderId, { $pull: { following: receiverId } });
    await UserAuth.findByIdAndUpdate(receiverId, { $pull: { followers: senderId } });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowStatus = async (req, res) => {
  try {
    const user = await UserAuth.findById(req.user.id).populate("following", "_id");
    const requests = await FollowRequest.find({ sender: req.user.id, status: "pending" });

    const following = user.following.map((f) => f._id.toString());
    const requested = requests.map((r) => r.receiver.toString());

    res.status(200).json({ following, requested });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



export const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware

    const user = await UserAuth.findById(userId)
      .populate("followers", "name username profilePic bio")
      .select("followers");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      count: user.followers.length,
      followers: user.followers,
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserAuth.findById(userId)
      .populate("following", "name username profilePic bio")
      .select("following");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      count: user.following.length,
      following: user.following,
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return res.status(500).json({ message: "Server error" });
  }
};