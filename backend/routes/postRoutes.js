const express = require("express");
const router = express.Router();
const db = require("../db");
const upload = require("../middleware/upload");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/create", authenticateToken, upload.single("image"), (req, res) => {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!content) return res.status(400).json({ message: "Post content is required" });

    db.query(
        "INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)",
        [req.user.id, content, imageUrl],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            res.json({ message: "Post created successfully", postId: result.insertId });
        }
    );
});

router.get("/all", authenticateToken, (req, res) => {
    db.query(
        `SELECT posts.*, users.username, users.profile_pic, 
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likeCount
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY posts.created_at DESC`,
        (err, postsResult) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            res.json(postsResult);
        }
    );
});

router.get("/my/:userId", authenticateToken, (req, res) => {
    const userId = req.params.userId;

    db.query(
        `SELECT posts.*, users.username, users.profile_pic, 
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS likeCount 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE users.id = ? 
        ORDER BY posts.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            res.json(results);
        }
    );
});

router.post("/:postId/like", authenticateToken, (req, res) => {
    const postId = req.params.postId; // Get postId from URL params
    const userId = req.user.id; // Get the user ID from the token

    // Check if the user has already liked the post
    db.query(
        "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
        [userId, postId],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (result.length > 0) {
                // User has already liked the post, so un-like it
                db.query(
                    "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
                    [userId, postId],
                    (err) => {
                        if (err) return res.status(500).json({ message: "Error unliking post", error: err });

                        // Fetch the updated like count from the likes table
                        db.query(
                            "SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?",
                            [postId],
                            (err, countResult) => {
                                if (err) return res.status(500).json({ message: "Error fetching like count", error: err });

                                // Send the response with the updated like count
                                res.json({
                                    message: "Post unliked",
                                    likeCount: countResult[0].likeCount,
                                });
                            }
                        );
                    }
                );
            } else {
                // User hasn't liked the post yet, so like it
                db.query(
                    "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
                    [userId, postId],
                    (err) => {
                        if (err) return res.status(500).json({ message: "Error liking post", error: err });

                        // Fetch the updated like count from the likes table
                        db.query(
                            "SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?",
                            [postId],
                            (err, countResult) => {
                                if (err) return res.status(500).json({ message: "Error fetching like count", error: err });

                                // Send the response with the updated like count
                                res.json({
                                    message: "Post liked",
                                    likeCount: countResult[0].likeCount,
                                });
                            }
                        );
                    }
                );
            }
        }
    );
});

router.post("/:postId/comments", authenticateToken, (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Get the user ID from the token

    if (!content) {
        return res.status(400).json({ message: "Comment content is required" });
    }

    // Insert the comment into the database
    db.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [postId, userId, content],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            res.status(201).json({
                message: "Comment added successfully",
                commentId: result.insertId,
                content,
                postId,
                userId
            });
        }
    );
});




router.get("/:postId/comments", (req, res) => {
    const { postId } = req.params;

    db.query(
        `SELECT comments.*, users.username, users.profile_pic 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.post_id = ? 
        ORDER BY comments.created_at DESC`,
        [postId],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });
            
            res.json(results);
        }
    );
});






module.exports = router;
