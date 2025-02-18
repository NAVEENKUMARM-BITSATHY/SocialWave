import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import React, { useEffect, useState, useRef } from "react";
import { fetchUserDetails, updateProfilePhoto, deleteProfilePhoto } from "../api/fetchUser";
import { Button, Typography } from "@mui/material";
import "../styles/Navbar.css";

const Navbar = ({ setIsMyFeed }) => {
    const [user, setUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId) {
            fetchUserDetails(userId).then((data) => setUser(data));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select a file");

        const userId = localStorage.getItem("userId");
        try {
            const response = await updateProfilePhoto(userId, selectedFile);
            alert(response.data.message);
            setUser((prevUser) => ({ ...prevUser, profile_pic: response.data.profilePic }));
        } catch (error) {
            console.error("Error updating profile picture:", error);
        }
    };

    const handleDeletePhoto = async () => {
        const userId = localStorage.getItem("userId");
        try {
            const response = await deleteProfilePhoto(userId);
            alert(response.data.message);
            setUser((prevUser) => ({ ...prevUser, profile_pic: null })); // Remove photo from UI
        } catch (error) {
            console.error("Error deleting profile picture:", error);
        }
    };

    const handleIconClick = () => {
        fileInputRef.current.click();
    };

    return (
        <nav className="navbar">
            <div className="navBarOptions">
                <Typography variant="p" align="center" className="logoName">Social Wave</Typography>
                <div className="userInfo">
                    {user ? (
                        <>
                            <Typography variant="p" align="center" className="userName">{user.username} </Typography>
                            {user.profile_pic ? (
                                <div className="profileContainer">
                                    <img
                                        src={`http://localhost:5000${user.profile_pic}`}
                                        alt="Profile"
                                        className="profilePic"
                                    />
                                    <DeleteIcon
                                        className="delete-icon"
                                        onClick={handleDeletePhoto}
                                        titleAccess="Delete Profile Picture"
                                    />
                                </div>
                            ) : (
                                <div className="uploadContainer">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                    <AddCircleOutlineIcon
                                        className="upload-icon"
                                        onClick={handleIconClick}
                                        titleAccess="Upload Profile Picture"
                                        style={{ width: 100, height: 100 }}
                                    />
                                    <Button onClick={handleUpload} variant="contained" color="primary">
                                        Upload Photo
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <a href="/login">Login</a>
                    )}
                </div>

                <div className="feedToggleButtons">
                <Button variant="contained"  className="allFeedButton" onClick={() => setIsMyFeed(false)}>
                    All Feeds
                </Button>
                <Button variant="contained"  className="myFeedButton" onClick={() => setIsMyFeed(true)}>
                    My Feeds
                </Button>
            </div>
            </div>

            <Button onClick={handleLogout} variant="contained" color="secondary" className="LogOutButton">
                Logout
            </Button>
        </nav>
    );
};

export default Navbar;
