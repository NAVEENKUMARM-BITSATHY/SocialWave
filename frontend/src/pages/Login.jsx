import React, { useState } from "react";
import "../styles/login.css";
import { Card, CardContent, TextField, Typography, Button } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode}  from "jwt-decode";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            if (response.status === 200) {
                const { token } = response.data;
                console.log(token);

                localStorage.setItem("token", token);

                // Decode userId from JWT
                const decodedToken = jwtDecode(token);
                localStorage.setItem("userId", decodedToken.userId);
                console.log(localStorage.getItem("userId"));


                window.location.href = "/"; // Refresh page
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        }
    };

    return (
        <div className="loginContainer">
            <Card variant="outlined" className="loginCard">
                <CardContent className="loginCardContents">
                    <Typography variant="h2" className="titleName">
                        Social Wave
                    </Typography>

                    {error && <Typography color="error">{error}</Typography>}

                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
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

                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleSubmit}
                        className="submitButton"
                    >
                        Log In
                    </Button>
                </CardContent>
            </Card>

            <Typography variant="h6" className="registerContainer">
                Don't have an account?{" "}
                <span className="spanTag" onClick={() => navigate("/signup")}>Sign up</span>
            </Typography>
        </div>
    );
};

export default Login;
