import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import mongoose from 'mongoose';


// export const getConversationsByUserId = async (req, res) => {
//     try {
//         const loggedInUserId = req.params.userId;
//         let conversations = await Conversation.find({ participants: { $in: [loggedInUserId] } }).populate("participants", "_id fullName profilePic");

//         // Modify each conversation
//         conversations = conversations.map(conversation => {
//             // If the conversation type is 'user', set the name and img to the other user's fullName and profilePic
//             if (conversation.type === 'user') {
//                 const otherUser = conversation.participants.find(participant => participant._id.toString() !== loggedInUserId.toString());
//                 conversation.name = otherUser.fullName;
//                 conversation.img = otherUser.profilePic;
//             }

//             return conversation;
//         });

//         res.status(200).json(conversations);
//     } catch (error) {
//         console.log("Error in getConversations controller: ", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };

export const getConversationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        let conversations = await Conversation.find({ participants: { $in: [userId] } })
            .populate("participants", "_id fullName profilePic");

        // Modify each conversation
        conversations = conversations.map(conversation => {
            if (conversation.type === 'user') {
                const otherUser = conversation.participants.find(participant => participant._id.toString() !== userId.toString());
                // Check if otherUser exists
                if (otherUser) {
                    conversation.name = otherUser.fullName;
                    conversation.img = otherUser.profilePic;
                } else {
                    conversation.name = "Unknown User";
                    conversation.img = ""; // Default image or placeholder
                }
            }
            return conversation;
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error in getConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// hàm tạo một conversation có kiểu là user khi 2 người đồng ý kết bạn
export const createConversationUser = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const loggedInUserId = req.params.myId;
        
        // Create a new conversation with type 'user' and participants
        const conversation = new Conversation({
            type: 'user',
            participants: [receiverId, loggedInUserId]
        });

        // Save the conversation to the database
        await conversation.save();

        res.status(201).json(conversation);
    } catch (error) {
        console.log("Error in createConversation controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// hàm trả về thành viên của conversation truyền vào conversationId
// và truyền vào currentUserId trừ User hiện tại
export const getParticipants = async (req, res) => {
    try {
        const { conversationId, currentUserId } = req.params;
        const conversation = await Conversation.findById(conversationId).populate("participants", "_id fullName profilePic");

        // Filter out the current user
        const participants = conversation.participants.filter(participant => participant._id.toString() !== currentUserId);

        res.status(200).json(participants);
    } catch (error) {
        console.log("Error in getParticipants controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// hàm lấy thông tin của conversation truyền vào conversationId
export const getConversationById = async (req, res) => {
    try {
        const { conversationId, userId } = req.params;
        const conversation = await Conversation.findById(conversationId).populate("participants", "_id fullName profilePic");
        if (conversation.type === 'user') {
            const otherUser = conversation.participants.find(participant => participant._id.toString() !== userId.toString());
            // Check if otherUser exists
            if (otherUser) {
                conversation.name = otherUser.fullName;
                conversation.img = otherUser.profilePic;
            } else {
                conversation.name = "Unknown User";
                conversation.img = ""; // Default image or placeholder
            }
        }
        // return conversation;
        res.status(200).json(conversation);
    } catch (error) {
        console.log("Error in getConversationById controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};