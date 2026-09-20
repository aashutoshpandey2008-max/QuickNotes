const express = require("express");
const dns = require("node:dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Note = require("./models/Note");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "QuickNotes API is running"
  });
});

// ==================================
// GET - Fetch all notes
// ==================================

app.get("/notes", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notes"
    });
  }
});

// ==================================
// POST - Create a new note
// ==================================

app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      typeof content !== "string" ||
      !title.trim() ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required"
      });
    }

    const newNote = new Note({
      title: title.trim(),
      content: content.trim()
    });

    const savedNote = await newNote.save();

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({
      message: "Error creating note"
    });
  }
});

// ==================================
// DELETE - Delete a note
// ==================================

app.delete("/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        message: "Invalid note ID"
      });
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({
        message: "Note not found"
      });
    }

    res.status(200).json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting note"
    });
  }
});

// ==================================
// Connect MongoDB and start server
// ==================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();