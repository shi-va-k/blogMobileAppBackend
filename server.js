const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const Message = require('./model/ChatMessage');
const User = require('./model/User');
const createNewUser = require("./routes/userRoutes");
const imageRoutes = require("./routes/userPostRoute");
const commentRoute = require("./routes/commentRoute");
const savedPosts = require("./routes/savedPostRoute");

dotenv.config(); 

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT 

app.use(cors({ origin: process.env.FRONTEND_URL}));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));

mongoose
  .connect(process.env.Mongo_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error:", err));

app.use("/user", createNewUser);
app.use("/images", imageRoutes);
app.use("/comments", commentRoute);
app.use("/saved", savedPosts);

app.post('/sendRequest', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    receiver.requests.push({ from: senderId, message });
    await receiver.save();

    res.status(200).json({ message: "Request sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error sending request.", error });
  }
});

app.get('/getRequests/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('requests.from', 'name mobile');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user.requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

app.post('/acceptRequest', async (req, res) => {
  try {
    const { userId, requestId } = req.body;

    if (!userId || !requestId) {
      return res.status(400).json({ message: 'Missing userId or requestId.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {requests: {from: requestId}}
      },
      {new: true}
    )
  if(!updateUser){
    return res.status(404).json({ message: 'Request not found.' })
  }
    const request = user.requests.find(req => req._id.toString() === requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const friendId = request.from;
    await User.findByIdAndUpdate(userId, { $push: { friends: friendId }, $pull: { requests: { _id: requestId } } });
    await User.findByIdAndUpdate(friendId, { $push: { friends: userId } });

    res.status(200).json({ message: 'Friend request accepted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('friends', 'name mobile image email');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user.', error });
  }
});

const userSocketMap = {}; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("User socket map:", userSocketMap);
  }

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
  });

  socket.on("send message", async ({ senderId, receiverId, message }) => {
    try {
      const receiverSocketId = userSocketMap[receiverId];
      const newMessage = new Message({ senderId, receiverId, message });
      await newMessage.save(); 

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          senderId,
          message,
        });
      } else {
        console.log("Receiver is offline.");
      }
    } catch (error) {
      console.log("Error sending message:", error);
    }
  });
});

app.post("/sendMessage", async(req, res) => {
  try {
    const {senderId, receiverId, message} = req.body;

    const newMessage = new Message({
      senderId,
      receiverId,
      message
    });
    await newMessage.save();

    const receiverSocketId = userSocketMap[receiverId];
    if(receiverSocketId){
      console.log('Emitting receiveMessage event to the receiver', receiverId);
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("Receiver socket ID not found");
    }
    res.status(202).json(newMessage);
  } catch (error) {
    console.log(error, 'Error occurred');
    res.status(500).json({ message: "Failed to send message", error });
  }
});

app.get("/messages", async(req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const messages = await Message.find({
      $or:[
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).populate('senderId', "id name");

    res.status(200).json(messages);

  } catch (error) {
    console.log(error, "Error occurred");
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
