import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

export default verifyToken;
