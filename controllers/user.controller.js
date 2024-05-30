import User from "../models/user.model.js";

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