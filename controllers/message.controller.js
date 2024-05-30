import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
	try {
		// message được truyền vào khi body của fetch API sendMessage
		const { message } = req.body;

		// id của conversation vào khi fetch API sendMessage/:id
		const {
			id: conversationId,
			senderId: senderId
		} = req.params;

		// lấy từ middleware auth
		// const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			_id: conversationId,
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, conversationId],
			});
		}

		const newMessage = new Message({
			senderId,
			conversationId: conversationId,
			message,
			type: "text", // mặc định là text nhưng nếu gửi ảnh thì type sẽ là image
		});

		await newMessage.save();

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(conversationId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		// // const { id: userToChatId } = req.params;
		// const { id: userToChatId } = req.params
		// const senderId = req.user._id;

		// const conversation = await Conversation.findOne({
		// 	participants: { $all: [senderId, userToChatId] },
		// }).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		// if (!conversation) return res.status(200).json([]);

		const conversationId = req.params.id;
		const conversation = await Conversation.findById(conversationId).populate("messages");

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

// hàm thu hồi tin nhắn (cập nhật tin nhắn thành "Tin nhắn đã thu hồi")
export const recallMessage = async (req, res) => {
	try {
		const { conversationId, messageId } = req.params;

		const updatedMessage = await Message.findOneAndUpdate(
			{ _id: messageId },
			{ message: "Tin nhắn đã được thu hồi", status: 'recall' },
			// { new: true }
		);

		if (!updatedMessage) {
			return res.status(404).json({ error: "Message not found" });
		}

		const receiverSocketId = getReceiverSocketId(conversationId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageRetracted", updatedMessage);
		}

		res.status(200).json(updatedMessage);
	} catch (error) {
		console.log("Error in retractMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};