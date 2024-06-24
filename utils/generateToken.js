import jwt from "jsonwebtoken";

// Function to generate token and set cookie
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  console.log("Generated JWT:", token);
  // Set the cookie using the generated token
  res.cookie("JWT", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in milliseconds
    httpOnly: true, // For security
    secure: flase, // Enable for production
    sameSite: "lax", // Or "strict" as needed
	domain: "localhost:3000",
	path: "/",

  });
};

export default generateTokenAndSetCookie;
