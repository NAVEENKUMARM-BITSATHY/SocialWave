import React, { useEffect, useState } from "react";
import { fetchAllPosts, fetchMyPosts, toggleLikePost } from "../api/postApi";
import { Avatar, Typography, Card, CardContent, CardMedia, CardHeader, Modal, Button, TextField, Fab, IconButton, List, ListItem, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import "../styles/postList.css";

const PostList = ({ isMyFeed }) => {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false); // Modal open state
    const [newPostContent, setNewPostContent] = useState(""); // State for new post content
    const [selectedFile, setSelectedFile] = useState(null); // File state for post image
    const [comments, setComments] = useState({}); // Separate comment state for each post
    const [filterAnchorEl, setFilterAnchorEl] = useState(null); // Anchor for dropdown
    const [filter, setFilter] = useState("newest");
    const [activeCommentPostId, setActiveCommentPostId] = useState(null); // Track post where comment box should be active

    // Define fetchPostsAndComments function here
    const fetchPostsAndComments = async () => {
        const userId = localStorage.getItem("userId");

        try {
            const response = isMyFeed ? await fetchMyPosts(userId) : await fetchAllPosts();
            let postsData = response.data;

            if (postsData.length === 0) {
                setPosts([]);  // Set the posts state to an empty array
                return;  // Stop further processing if there are no posts
            }

            // Fetch comments for each post and ensure they are included
            const postsWithComments = await Promise.all(
                postsData.map(async (post) => {
                    try {
                        const commentsResponse = await fetch(`http://localhost:5000/api/posts/${post.id}/comments`);
                        const commentsData = await commentsResponse.json();
                        return { ...post, comments: commentsData, commentCount: commentsData.length }; // Added commentCount
                    } catch (error) {
                        console.error(`Error fetching comments for post ${post.id}:`, error);
                        return { ...post, comments: [], commentCount: 0 }; // Default to 0 if error occurs
                    }
                })
            );


            // Apply sorting before setting the state
            let sortedPosts = [...postsWithComments];
            switch (filter) {
                case "newest":
                    sortedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case "oldest":
                    sortedPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    break;
                case "highLikes":
                    sortedPosts.sort((a, b) => b.likeCount - a.likeCount);
                    break;
                case "highComments":
                    sortedPosts.sort((a, b) => b.comments.length - a.comments.length); // Sort by actual comments length
                    break;
                default:
                    break;
            }

            setPosts(sortedPosts);
        } catch (err) {
            console.error("Error fetching posts or comments:", err);
        }
    };

    // Call the function inside useEffect
    useEffect(() => {
        fetchPostsAndComments(); // Call the function to fetch posts and comments when the component mounts
    }, [isMyFeed, filter]); // The effect depends on isMyFeed and filter changes

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

    // Handle active comment box toggle
    const handleCommentIconClick = (postId) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null); // Close the input if it's already active
        } else {
            setActiveCommentPostId(postId); // Open the input box for the selected post
        }
    };

    // ✅ Handle Comment Submit
    const handleCommentSubmit = async (postId) => {
        const newComment = comments[postId];
        if (!newComment) return alert("Comment content is required");
    
        try {
            // Send new comment to the backend
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
    
            const result = await response.json(); // The new comment returned from the backend
    
            // Append the new comment to the existing post's comments
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            comments: [...post.comments, result],  // Add the new comment
                            commentCount: post.commentCount + 1,  // Increment the comment count
                        }
                        : post
                )
            );
    
            // Clear the comment input for that specific post
            setComments((prevComments) => {
                const updatedComments = { ...prevComments };
                delete updatedComments[postId]; // Remove comment input after submission
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

        // Add the new post to the posts array directly
        setPosts((prevPosts) => [result, ...prevPosts]);  // Add new post at the beginning

        // Clear the form fields
        setNewPostContent(""); // Clear input
        setSelectedFile(null); // Clear file
        handleClose(); // Close modal

        // Optionally, refetch posts to ensure synchronization
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

    // ✅ Filter Functions
    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterSelect = (selectedFilter) => {
        setFilter(selectedFilter);
        handleFilterClose(); // Close the filter menu after selection
    };

    return (
        <div className="postList">
            <div className="header">
                <Typography variant="h4" className="feedTitle">
                    {isMyFeed ? "My Feeds" : "Feeds"}
                </Typography>
                <IconButton onClick={handleFilterClick} color="primary" className="filterIcon">
                    <FilterListIcon />
                </IconButton>
            </div>
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                <MenuItem onClick={() => handleFilterSelect("newest")}>Newest</MenuItem>
                <MenuItem onClick={() => handleFilterSelect("oldest")}>Oldest</MenuItem>
                <MenuItem onClick={() => handleFilterSelect("highLikes")}>High Likes</MenuItem>
                <MenuItem onClick={() => handleFilterSelect("highComments")}>High Comments</MenuItem>
            </Menu>

            {posts.length === 0 ? (
                <Typography variant="h6" className="noPostsMessage">
                    <AddAPhotoIcon color="primary" className="addposticon" />
                    No posts yet
                </Typography>
            ) : (
                posts.map((post) => (
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
                                <Typography variant="body2">{post.likeCount || 0}</Typography>
                                <IconButton onClick={() => handleCommentIconClick(post.id)} color="default" className="commentIconButton">
                                    <ChatBubbleIcon />
                                </IconButton>
                                <Typography variant="body2">{post.commentCount || 0}</Typography>
                            </div>

                            {activeCommentPostId === post.id && (
                                <div className="commentInput">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        value={comments[post.id] || ""}
                                        onChange={(e) => handleCommentChange(e, post.id)}
                                    />
                                    <Button onClick={() => handleCommentSubmit(post.id)} variant="contained" color="primary">
                                        Post Comment
                                    </Button>
                                </div>
                            )}

                            <div className="commentsSection">
                                <List className="commentsList">
                                    {post.comments.map((comment) => (
                                        <ListItem key={comment.id}>
                                            <Typography variant="body2">
                                                <strong>{post.username}:</strong> {comment.content}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* ✅ Floating Action Button */}
            <Fab color="primary" className="fabButton" onClick={handleOpen} sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                <AddIcon />
            </Fab>

            {/* ✅ Modal for Creating New Post */}
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
