const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

app.use("/uploads", express.static("uploads")); 

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`server running on port ${PORT}`));