require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { User, Todo, Schedule, Module, Class, Message } = require("./models");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const classAccess = require("./middleware/ClassAccess");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{
      width: 300,
      height: 300,
      crop: "fill",
      gravity: "face"
    }]
  }
});

const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "covers",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{
      crop:"fill",
      gravity: "auto"
    }]
  }
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadCover = multer({ storage: coverStorage });

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/api", (req, res) => {
    res.json({ status: "ok" });
});

mongoose.connect("mongodb+srv://franciskenjiemaraasin_db_user:luockkxssouse@cluster0.eglmq1z.mongodb.net/regiteredUser")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err)
);

app.post("/register_account", async (req, res) => {
  try {
    const { username, email } = req.body;

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

    await user.save();
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

    const token = jwt.sign(
      { userId: userExist._id },
      process.env.JWT_PASS,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/loadUser", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  const userTodo = await Todo.find({ user: req.userId });
  const userSched = await Schedule.find({ user: req.userId });
  const userModule = await Module.find({ user: req.userId });
  const userClasses = await Class.find({ members: req.userId });
  res.json({ user, userTodo, userSched, userModule, userClasses });
});

app.put("/update", auth, async (req, res) => {
  const { username, birthdate, email, school, year, course } = req.body;
  const userId = req.userId;

  try {
    const update = await User.findByIdAndUpdate(userId,
      { username, email, birthdate, school, year, course },
      { new: true, runValidators: true }
    );

    res.json({ ok: true, user: update})
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update Failed" })
  }
});

app.post("/upload-avatar", auth, uploadAvatar.single("image"), async (req, res) => {
  try{
    if (!req.file){
      return res.status(400).json({ error: "No file uploaded" });
    }

    await User.findByIdAndUpdate(req.userId, {
      avatar: req.file.path
    });

    res.json({ avatar:req.file.path });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: "Avatar Failed" });
  }
});

app.post("/upload-cover", auth, uploadCover.single("image"), async (req, res) => {
  try{
    if (!req.file){
      return res.status(400).json({ error: "No file uploaded" });
    }

    await User.findByIdAndUpdate(req.userId, {
      cover: req.file.path
    });
    res.json({ cover:req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cover Failed" });
  }

});

app.post("/addTask", auth, async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!req.body.due){
      return res.status(400).json({ error: "Due date is required" })
    }

    const todo = new Todo({
      user: req.userId,
      title: req.body.title,
      due: new Date(req.body.due),
      completed: req.body.completed ?? false
    });

    await todo.save();
    res.status(201).json({ ok: true, todo });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "theires a Bug!!!!"});
  }
});

app.patch("/completed/:id", auth, async (req, res) => {
  try{
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id , user: req.userId }, { completed: req.body.completed }, { new: true }
    );

    if (!todo){
      return res.status(404).json({ error: "todo not found" });
    }
    res.json({ ok: true, todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error"});
  }
});

app.post("/addSched", auth, async (req, res) => {
  try{
    if(!req.body.title){
      return res.status(400).json({ error: "no title" });
    }

    if(!req.body.day){
      return res.status(400).json({ error: "no day" });
    }

    if(!req.body.from){
      return res.status(400).json({ error: "no from" });
    }

    if(!req.body.to){
      return res.status(400).json({ error: "no to" });
    }

    const sched = new Schedule({
      user: req.userId,
      title: req.body.title,
      day: req.body.day,
      from: req.body.from,
      to: req.body.to
    }); 

    await sched.save();
    res.status(201).json({ ok: true, sched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" })
  }
});

app.post("/addModule", auth, async (req, res) => {
  try{
    if (!req.body.link){
      return res.status(400).json({ error: "no file attached" });
    }

    if (!req.body.title){
      return res.status(400).json({ error: "title required" })
    }

    const module = new Module({
      user: req.userId,
      title: req.body.title,
      link: req.body.link,
    });

    await module.save();
    res.status(201).json({ ok: true, module });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.delete("/delete/:id", auth, async (req, res) => {
  try{
    const query = { _id: req.params.id, user: req.userId };
    const moduleDoc = await Module.findOne(query);
    const todoDoc = await Todo.findOne(query);
    const schedDoc = await Schedule.findOne(query);

    if (!moduleDoc && !todoDoc && !schedDoc){
      return res.status(404).json({ error: "Item not found" });
    }

    if (todoDoc) {
      await todoDoc.deleteOne();
    }

    if (schedDoc) {
      await schedDoc.deleteOne();
    }

    if (moduleDoc){
      await moduleDoc.deleteOne();
    }

    res.json({ message: "todo delete successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" })
  }
});

app.post("/createClass", auth, async (req, res) => {
  try{
    if (!req.body.class_name){
      return res.status(400).json({ error: "no class name" });
    }

    const classes = new Class({
      class_name: req.body.class_name,
      members: [req.userId]
    });
    
    await classes.save();
    res.status(200).json({ ok: true, classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/classes/:classId/leaveClass", auth, classAccess, async(req, res) => {
  try {
    const leaveClass = await Class.findByIdAndUpdate(
      req.params.classId,
      { $pull: { members: req.userId } },
      { new: true }
    );

    if (!leaveClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.status(200).json({ ok: true, leaveClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/classes/:classId/sendMessage", auth, classAccess, async (req, res) => {
  try{
    if(!req.body.message){
      return res.status(400).json({ error: "No Message" });
    }
    const user = await User.findById(req.userId).select("avatar username email");

    const message = new Message({
      class: req.params.classId,
      sender: req.userId,
      avatar: user.avatar,
      user: user.username,
      email: user.email,
      message: req.body.message
    });

    await message.save();
    res.status(200).json({ ok: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/classes/:classId/loadMessages", auth, classAccess, async(req, res) => {
  try{
    const classAnnouncements = await Message.find({ class: req.params.classId }).sort({ createdAt: 1 });
    await res.json({ classAnnouncements });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server failed on loading messages" });
  }
});

app.delete("/classes/:classId/deleteMessage/:messageId", auth, classAccess, async(req, res) => {
  try{
    const deleteMessage = await Message.findOne({ 
      _id: req.params.messageId, 
      sender: req.userId, 
      class: req.params.classId
    });

    if(!deleteMessage){
      return res.status(404).json({ error: "permission to delete denied" });
    }
    await deleteMessage.deleteOne();
    res.json({ message: "Deleted Successfully " });
  } catch (err) {
    console.error(err);
  }
});

app.put("/classes/:classId/editMessage/:messageId", auth, classAccess, async(req, res) => {
  try{
    const editMessage = await Message.findByIdAndUpdate(
      { _id: req.params.messageId, sender: req.userId, class: req.params.classId },
      { message: req.body.message },
    );

    if (!editMessage){
      return res.status(404).json({ error: "Message edit permission denied" });
    }

    res.json({ message: "Successfully edited" });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/classes/:classId/joinClass", auth, async (req, res) => {
  try{
    const updateClass = await Class.findByIdAndUpdate(
      req.params.classId,
      { $addToSet: { members: req.userId } },
      { new: true }
    );

    if (!updateClass){
      return res.status(404).json({ error: "Class do not Exist" });
    }

    res.json({ message: "Joined Class successfully" , class: updateClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port 3000");
});

