const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        console.log("🚨 No Authorization header found");
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("📌 Extracted Token:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("🚨 Invalid Token:", err.message);
            return res.status(403).json({ message: "Invalid Token" });
        }

        console.log("📌 Decoded Token User:", user);
        
        if (!user.userId) {
            console.log("🚨 Token does not contain `userId`");
            return res.status(403).json({ message: "Invalid token payload" });
        }

        req.user = { id: user.userId };
        next();
    });
};

module.exports = { authenticateToken };
