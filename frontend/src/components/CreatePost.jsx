import React, { useState } from "react";
import { createPost } from "../api/postApi";
import { Button, TextField } from "@mui/material";

const CreatePost = ({ refreshPosts }) => {
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);

    const handlePost = async () => {
        if (!content) return alert("Post content is required");

        try {
            await createPost(content, image);
            setContent("");
            setImage(null);
            refreshPosts();
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    return (
        <div className="create-post">
            <TextField label="Write something..." fullWidth value={content} onChange={(e) => setContent(e.target.value)} />
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
            <Button onClick={handlePost} variant="contained" color="primary">Post</Button>
        </div>
    );
};

export default CreatePost;
