import { io, getReceiverSocketId } from "../socket/socket.js";

export const startCall = async (req, res) => {
	try {
		const { receiverId } = req.params; // Lấy ID của người nhận từ URL
		const callerId = req.user._id; // Lấy ID của người gọi từ middleware xác thực

		// Tìm socket ID của người nhận
		const receiverSocketId = getReceiverSocketId(receiverId);

		if (!receiverSocketId) {
			return res.status(404).json({ error: "Người nhận không online" });
		}

		// Gửi thông báo đến người nhận
		io.to(receiverSocketId).emit("incomingCall", { callerId, callerName: "Tên người gọi" });

		res.status(200).json({ message: "Cuộc gọi đã được gửi" });
	} catch (error) {
		console.log("Error in startCall controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};