import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
export const getUserById = async (req, res) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error("Error in getUserById: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
// hàm tìm user by username
export const getUserByUsername = async (req, res) => {
	try {
		const username = req.params.username;
		const user = await User.findOne({ username }).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		res.status(200).json(user);
	}
	catch (error) {
		console.error("Error in getUserByUsername: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
}

//lấy tất cả user
export const getAllUsers = async (req, res) => {
	try {
		console.log("Attempting to fetch all users");
		const users = await User.find().select("-password");
		console.log("Users fetched successfully");
		res.status(200).json(users);
	} catch (error) {
		console.error("Error in getAllUsers: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// block người dùng
export const blockUser = async (req, res) => {
	try {
		const userId = req.params.id;
		console.log("Trying to block user with ID:", userId); // For debugging

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		user.isBlocked = true;
		await user.save();

		res.status(200).json({ message: "User blocked successfully" });
	} catch (error) {
		console.error("Error in blockUser: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// lấy tất cả user bị block
export const getAllBlockedUsers = async (req, res) => {
	try {
		console.log("Attempting to fetch all blocked users");
		const blockedUsers = await User.find({ isBlocked: true }).select("-password");
		console.log("Blocked users fetched successfully");
		res.status(200).json(blockedUsers);
	} catch (error) {
		console.error("Error in getAllBlockedUsers: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// unblock người dùng
export const unblockUser = async (req, res) => {
	try {
		const userId = req.params.id;
		console.log("Trying to unblock user with ID:", userId); // For debugging

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		user.isBlocked = false;
		await user.save();

		res.status(200).json({ message: "User unblocked successfully" });
	} catch (error) {
		console.error("Error in unblockUser: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


// thống kê theo từng tháng
export const countUsersByDay = async (req, res) => {
	try {
		const usersByDay = await User.aggregate([
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by date
					count: { $sum: 1 }, // Count the number of users for each date
				},
			},
			{
				$project: {
					_id: 0, // Remove the _id field
					date: "$_id", // Rename _id to date
					count: 1, // Keep the count field
				},
			},
		]);

		res.status(200).json(usersByDay);
	} catch (error) {
		console.error("Error in countUsersByDay: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// đếm tổng user bị block
export const countBlockedUsersByMonth = async (req, res) => {
	try {
		const blockedUsersByMonth = await User.aggregate([
			{
				$match: { isBlocked: true } // Filter only blocked users
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m", date: "$updatedAt" } }, // Group by month
					count: { $sum: 1 }, // Count the number of blocked users for each month
				},
			},
			{
				$project: {
					_id: 0, // Remove the _id field
					month: "$_id", // Rename _id to month
					count: 1, // Keep the count field
				},
			},
		]);

		res.status(200).json(blockedUsersByMonth);
	} catch (error) {
		console.error("Error in countBlockedUsersByMonth: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// lấy ra các conversation có nhiều tin nhắn nhất
export const getConversationsWithMostMessages = async (req, res) => {
	try {
		const conversations = await Conversation.aggregate([
			{
				$lookup: {
					from: "messages",
					localField: "_id",
					foreignField: "conversationId",
					as: "messages",
				},
			},
			{
				$project: {
					_id: 1,
					totalMessages: { $size: "$messages" },
				},
			},
			{
				$sort: { totalMessages: -1 },
			},
			{
				$limit: 5,
			},
		]);

		res.status(200).json(conversations);
	} catch (error) {
		console.error("Error in getConversationsWithMostMessages: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};