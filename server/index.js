require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();                 // 3. create the server
app.use(cors());                       // allow the React app to call us
app.use(express.json());               // understand JSON sent to us
app.use("/api/auth", require("./routes/auth"));

// 4. A route: when someone visits /api/health, reply with JSON
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 5. Start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

