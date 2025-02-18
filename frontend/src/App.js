import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from "./pages/Dashboard";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Start as null to prevent flashing

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token); // Convert token existence to boolean
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Show a loading screen until state is set
    }

    return (
        <Router>
            <Routes>
                {/* Protected Route - Redirect to login if not authenticated */}
                <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default App;
