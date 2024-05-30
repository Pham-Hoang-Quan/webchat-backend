import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			default: null,
		},
		img: {
			type: String,
			default: null,
		},
		type: {
			type: String,
			enum: ["user", "group"],
			default: "user",
		},
		participants: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
