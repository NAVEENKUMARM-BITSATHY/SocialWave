const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../middleware/upload");

// Update Profile Picture
router.post("/update-photo/:id", upload.single("profile_pic"), (req, res) => {
    const userId = req.params.id;

    console.log("Received userId:", userId);
    console.log("Received file:", req.file);

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePicUrl = `/uploads/${req.file.filename}`;

    db.query("UPDATE users SET profile_pic = ? WHERE id = ?", [profilePicUrl, userId], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json({ message: "Profile picture updated", profilePic: profilePicUrl });
    });
});
// Fetch User Details with Profile Picture
router.get("/:id", (req, res) => {
    const userId = req.params.id;

    db.query("SELECT id, username, email, profile_pic FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });

        res.json(results[0]);
    });
});

router.post("/delete-photo/:id", (req, res) => {
    const userId = req.params.id;

    console.log("Deleting profile picture for user:", userId);

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    db.query("UPDATE users SET profile_pic = NULL WHERE id = ?", [userId], (err) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json({ message: "Profile picture deleted" });
    });
});



module.exports = router;
