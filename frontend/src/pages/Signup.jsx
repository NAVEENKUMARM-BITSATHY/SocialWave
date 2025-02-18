import React, { useState } from 'react';
import "../styles/Signup.css";
import { Card, CardContent, TextField, Typography, Button } from '@mui/material';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            console.error("Passwords do not match!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                username,
                email,
                password,
            });

            if (response.status === 200) {
                alert("Signup Successful!");
                navigate("/login"); // Redirect to login page
            }
        } catch (err) {
            console.error(err.response?.data?.message || "Something went wrong!");
        }
    }

    return (
        <div className="signUpContainer">
            <Card variant="outlined" className='signupCard'>
                <CardContent className='signupCardContents'>
                    <Typography variant='h2' className='titleName'>Social Wave</Typography>

                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <TextField
                        label="Re-enter Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleSubmit}
                        className="submitButton"
                    >
                        Sign Up
                    </Button>
                </CardContent>
            </Card>


            <Typography variant='h6' className='registerContainer'>Already have an account? <span className='spanTag'>Log in</span></Typography>

        </div>
    );
}

export default Signup