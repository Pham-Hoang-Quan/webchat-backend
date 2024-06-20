import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/conversation.model.js";

const app = express(); // Khởi tạo express app

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const getParciticationIds = async (conversationId) => {
	try {
		const conversation = await Conversation.findById(conversationId);
		return conversation.participants;
	} catch (error) {
		console.log("Error in getParciticationIds controller: ", error.message);
	}

}

const userSocketMap = {}; // {userId: socketId}
const conversationSocketMap = {}; // {conversationId: [socketId1, socketId2, ...]}

/// github
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
////////////////////////////////
// Lấy socketId của người nhận dựa trên userId
export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

// Lấy danh sách socketId của các thành viên trong conversation
export const getReceiverSocketIds = (conversationId) => {
	return conversationSocketMap[conversationId];
};

io.on("connection", (socket) => {
	console.log("A user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId !== "undefined") {
		userSocketMap[userId] = socket.id;
	}

	// Gửi danh sách người dùng online cho tất cả client
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// Xử lý sự kiện khi một người dùng ngắt kết nối
	socket.on("disconnect", () => {
		console.log("User disconnected", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	// Xử lý sự kiện bắt đầu cuộc gọi video
	// 
	socket.on("startCall", async (data) => {
		const { conversationId, callerId } = data;
		const receiverIds = await getParciticationIds(conversationId);

		// Duyệt qua danh sách receiverIds và gửi sự kiện "callAccepted" cho từng người nhận
		receiverIds.forEach(receiverId => {
			const receiverSocketId = getReceiverSocketId(receiverId);
			if (receiverSocketId && receiverSocketId !== socket.id) {
				io.to(receiverSocketId).emit("incomingCall", {
					callerId,
					conversationId
				});
				// Gửi sự kiện "callAccepted" đến người nhận để tự động chấp nhận cuộc gọi
				io.to(receiverSocketId).emit("callAccepted", {
					callerId,
					conversationId
				});
				console.log("callAccepted in conversationId: ", conversationId);
			}
		});
	});
	socket.on("joinRoom", (conversationId) => {
		socket.join(conversationId);
		console.log(`User joined room ${conversationId}`);
	});
	// Xử lý sự kiện tín hiệu WebRTC
	socket.on("webrtcSignal", async (data) => {
		const { signal, conversationId } = data;
		const receiverIds = await getParciticationIds(conversationId);
		console.log(receiverIds)
		if (receiverIds) {
			receiverIds.forEach(receiverId => {
				const receiverSocketId = getReceiverSocketId(receiverId);
				if (receiverSocketId !== socket.id) {
					io.to(receiverSocketId).emit("webrtcSignal", signal);
					console.log("webrtcSignal in conversationId: ", conversationId);
				}
			});
		} else {
			console.log("no receiverSocketId");
		}
	});

	// Xử lý sự kiện từ chối cuộc gọi
	socket.on("callDeclined", async (data) => {
		const { conversationId } = data;
		const receiverIds = await getParciticationIds(conversationId);
		// console.log(receiverIds)
		if (receiverIds) {
			receiverIds.forEach(receiverId => {
				const receiverSocketId = getReceiverSocketId(receiverId);
				if (receiverSocketId !== socket.id) {
					io.to(receiverSocketId).emit("callDeclined", { conversationId });
					console.log("callDeclined in conversationId: ", conversationId);
				}
			});
		} else {
			console.log("no receiverSocketId");
		}
	});

	/////github
	socket.on("room:join", (data) => {
		const { email, room } = data;
		emailToSocketIdMap.set(email, socket.id);
		socketidToEmailMap.set(socket.id, email);
		io.to(room).emit("user:joined", { email, id: socket.id });
		socket.join(room);
		io.to(socket.id).emit("room:join", data);
	  });
	
	  socket.on("user:call", ({ to, offer }) => {
		io.to(to).emit("incomming:call", { from: socket.id, offer });
	  });
	
	  socket.on("call:accepted", ({ to, ans }) => {
		io.to(to).emit("call:accepted", { from: socket.id, ans });
	  });
	
	  socket.on("peer:nego:needed", ({ to, offer }) => {
		console.log("peer:nego:needed", offer);
		io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
	  });
	
	  socket.on("peer:nego:done", ({ to, ans }) => {
		console.log("peer:nego:done", ans);
		io.to(to).emit("peer:nego:final", { from: socket.id, ans });
	  });
	  ////////////////////////////////////////////////////////////////
});

export { app, io, server };
