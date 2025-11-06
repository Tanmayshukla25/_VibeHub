import FollowRequest from "../models/FollowRequest.js";
import UserAuth from "../models/userSchema.js";

export const sendFollowRequest = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const senderId = req.user.id;

    const existing = await FollowRequest.findOne({ sender: senderId, receiver: receiverId });
    if (existing) {
      return res.status(400).json({ message: "Request already sent or user already followed" });
    }

    const newRequest = new FollowRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();
    return res.status(200).json({ message: "Follow request sent", request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const request = await FollowRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    request.status = "accepted";
    await request.save();

    await UserAuth.findByIdAndUpdate(request.sender, { $push: { following: request.receiver } });
    await UserAuth.findByIdAndUpdate(request.receiver, { $push: { followers: request.sender } });

    res.status(200).json({ message: "Follow request accepted" });
  } catch (err) {
    console.error(err);
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
