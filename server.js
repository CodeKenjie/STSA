const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/Users");

const app = express();

app.use(cors({
  origin: "http://localhost:5500"
}));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://franciskenjiemaraasin_db_user:luockkxssouse@cluster0.eglmq1z.mongodb.net/regiteredUser")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.post("/register_account", async (req, res) => {
  console.log("REGISTER Successfully");
  console.log("BODY:", req.body);

  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ username, email });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: "username/email already exist"
      });
    }

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    const saved = await user.save();
    console.log("SAVED:", saved);

    res.json({ ok: true });
  } catch (err) {
    console.error("SAVE ERROR:", err);

    if(err.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Server Error"
      });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { user, password } = req.body;

  try {
    const userExist = await User.findOne({
      $or: [{ email: user }, { username: user }]
    });

    if (!userExist){
      return res.status(404).json({ error: "User not found" });
    }

    if (userExist.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    res.json({ message: "Login successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
