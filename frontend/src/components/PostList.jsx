import React, { useEffect, useState } from "react";
import { fetchAllPosts, fetchMyPosts, toggleLikePost } from "../api/postApi";
import { Avatar, Typography, Card, CardContent, CardMedia, CardHeader, Modal, Button, TextField, Fab, IconButton, List, ListItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FilterListIcon from "@mui/icons-material/FilterList";
import "../styles/postList.css";

const PostList = ({ isMyFeed }) => {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false); // Modal open state
    const [newPostContent, setNewPostContent] = useState(""); // State for new post content
    const [selectedFile, setSelectedFile] = useState(null); // File state for post image
    const [comments, setComments] = useState({}); // Separate comment state for each post
    const [filterAnchorEl, setFilterAnchorEl] = useState(null); // Anchor for dropdown
    const [filter, setFilter] = useState("newest");

    
    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const fetchPostsAndComments = async () => {
            try {
                const response = isMyFeed ? await fetchMyPosts(userId) : await fetchAllPosts();
                const postsData = response.data;

                // Fetch comments for each post
                const postsWithComments = await Promise.all(
                    postsData.map(async (post) => {
                        const commentsResponse = await fetch(`http://localhost:5000/api/posts/${post.id}/comments`);
                        const commentsData = await commentsResponse.json();

                        return { ...post, comments: commentsData };
                    })
                );

                setPosts(postsWithComments);
            } catch (err) {
                console.error("Error fetching posts or comments:", err);
            }
        };

        fetchPostsAndComments();
    }, [isMyFeed,filter]);

    // ✅ Open & Close Modal
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // ✅ Handle input changes
    const handlePostContentChange = (e) => setNewPostContent(e.target.value);
    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    // ✅ Handle Comment Input Change
    const handleCommentChange = (e, postId) => {
        setComments({
            ...comments,
            [postId]: e.target.value,
        });
    };

    // ✅ Handle Comment Submit
    const handleCommentSubmit = async (postId) => {
        const newComment = comments[postId];
        if (!newComment) return alert("Comment content is required");

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!response.ok) {
                throw new Error("Failed to add comment");
            }

            const result = await response.json();

            // Ensure post.comments is always an array
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: Array.isArray(post.comments)
                                ? [...post.comments, result]  // If comments is already an array, append the new comment
                                : [result]  // If comments is not an array, initialize it with the new comment
                        }
                        : post
                )
            );

            // Clear the comment input for that specific post
            setComments((prevComments) => {
                const updatedComments = { ...prevComments };
                delete updatedComments[postId]; // Clear the comment input for the specific post
                return updatedComments;
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Error adding comment. Please try again.");
        }
    };


    // ✅ Create a new post
    const handleCreatePost = async () => {
        if (!newPostContent) return alert("Post content is required");

        const formData = new FormData();
        formData.append("content", newPostContent);
        if (selectedFile) formData.append("image", selectedFile);

        try {
            const response = await fetch("http://localhost:5000/api/posts/create", {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            const result = await response.json();
            console.log("Post created:", result);

            // Refresh posts after successful creation
            setNewPostContent(""); // Clear input
            setSelectedFile(null); // Clear file
            handleClose(); // Close modal

            // ✅ Refresh the post list
            if (isMyFeed) {
                fetchMyPosts().then((res) => setPosts(res.data));
            } else {
                fetchAllPosts().then((res) => setPosts(res.data));
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Error creating post. Please try again.");
        }
    };

    // ✅ Handle Like Feature
    const handleLike = async (postId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("User not logged in, token missing.");
            return;
        }

        console.log(`Sending like/unlike request for Post ID: ${postId}`);

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // Ensure the user is authenticated
                },
            });

            const result = await response.json();

            // Update like count and state (isLiked) optimistically in the frontend
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { ...post, likeCount: result.likeCount, isLiked: !post.isLiked }
                        : post
                )
            );
        } catch (error) {
            console.error("Error liking/unliking the post:", error);
        }
    };

    return (
        <div className="postList">
            <Typography variant="h3" className="feedTitle">
                {isMyFeed ? "My Feeds" : "Feeds"}
            </Typography>
            {posts.map((post) => (
                <Card key={post.id} variant="outlined" className="postCards">
                    <CardHeader
                        avatar={<Avatar src={post.profile_pic ? `http://localhost:5000${post.profile_pic}` : "/default-avatar.png"} alt="Profile" />}
                        title={post.username}
                        subheader={new Date(post.created_at).toLocaleString()}
                    />
                    {post.image_url && (
                        <CardMedia component="img" image={`http://localhost:5000${post.image_url}`} alt="Post" className="postImage" />
                    )}
                    <CardContent>
                        <Typography variant="body1">{post.username} : {post.content}</Typography>

                        {/* ✅ Like Button */}
                        <div className="postActions">
                            <IconButton onClick={() => handleLike(post.id)} color={post.isLiked ? "primary" : "default"}>
                                <FavoriteIcon />
                            </IconButton>
                            <Typography variant="body2">{post.likeCount || 0} Likes</Typography>
                        </div>

                        {/* ✅ Comment Section */}
                        <div className="commentsSection">
                            <TextField
                                label="Write a comment"
                                value={comments[post.id] || ""}
                                onChange={(e) => handleCommentChange(e, post.id)}
                                fullWidth
                                multiline
                                rows={3}
                            />
                            <Button onClick={() => handleCommentSubmit(post.id)} variant="contained" color="primary">
                                Post Comment
                            </Button>

                            {/* Display Comments */}
                            <List>
                                {Array.isArray(post.comments) ? (
                                    post.comments.map((comment, index) => (
                                        <ListItem key={comment.id || index}> {/* Fallback to index if comment.id is not available */}
                                            <Typography variant="body2">
                                                <strong>{comment.username}:</strong> {comment.content}
                                            </Typography>
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2">No comments yet.</Typography>
                                )}
                            </List>

                        </div>
                    </CardContent>
                </Card>
            ))}

            <Fab color="primary" className="fabButton" onClick={handleOpen} sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                <AddIcon />
            </Fab>

            <Modal open={open} onClose={handleClose}>
                <div className="modalContent">
                    <Typography variant="h6">Create New Post</Typography>
                    <TextField
                        label="Content"
                        multiline
                        rows={4}
                        fullWidth
                        value={newPostContent}
                        onChange={handlePostContentChange}
                        variant="outlined"
                        margin="normal"
                    />
                    <input type="file" onChange={handleFileChange} />
                    <Button onClick={handleCreatePost} variant="contained" color="primary">
                        Post
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default PostList;
