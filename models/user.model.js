import mongoose from "mongoose";

// định nghĩa một documment trên của một collection
const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		gender: {
			type: String,
			required: true,
			enum: ["male", "female"],
		},
		profilePic: {
			type: String,
			default: "",
		},
		// createdAt, updatedAt => Member since <createdAt>
	},
	{ timestamps: true }
);

// khỏi tạo một model dùng userSchema, tương đương một colection trên mongoDB
const User = mongoose.model("User", userSchema);

// lúc này User là một đối tượng có thể thực hiện các thao tác với collection user trên mongoDB

export default User;

// ví dụ một document trên collection user
// {
//     "_id": { "$oid": "6631f693aaa872ce896f078e" },  // id là một trường tạo tự động để định danh một document 
//     "fullName": "Quan",
//     "username": "quan",
//     "password": "$2a$10$2/1Pi2ojG2dO.zvs/5wkV.05MHk/FOk6tI0ZJ7cKzr3s3Uuf4URIi",
//     "gender": "male",
//     "profilePic": "https://avatar.iran.liara.run/public/boy?username=quan",
//     "createdAt": { "$date": { "$numberLong": "1714550419976" } },
//     "updatedAt": { "$date": { "$numberLong": "1714550419976" } },
//     "__v": { "$numberInt": "0" }
// }

// _id là một trường đặc biệt được tạo ra tự động và chứa một giá trị duy nhất để định danh mỗi document.
// Các trường createdAt và updatedAt cũng được tạo ra tự động bởi Mongoose khi sử dụng tùy chọn timestamps: true trong schema.





