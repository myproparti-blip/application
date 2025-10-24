import jwt from "jsonwebtoken";

// Access token now valid for 2 days
export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
};

