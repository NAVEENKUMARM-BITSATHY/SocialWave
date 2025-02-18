const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "User registered successfully" });
        }
    );
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, users) => {
        if (err || users.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, users[0].password);
        if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: users[0].id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token, userId: users[0].id });
    });
};
