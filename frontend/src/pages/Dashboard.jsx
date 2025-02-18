import React, { useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/Dashboard.css"
import PostList from "../components/PostList";


const Dashboard = () => {
    const [isMyFeed, setIsMyFeed] = useState(false);

    return (
        <div className="hompageContainer">
            <div className="navbarcontainer">
                <Navbar setIsMyFeed={setIsMyFeed} />
            </div>
            <div className="contentContainer">
                <PostList isMyFeed={isMyFeed} />
            </div>

        </div>
    );
};

export default Dashboard;
