const About = require("../models/about");
const moment = require("moment-timezone");

// Add a new blog
const addBlog = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    try {
      const { title, description, images } = req.body;

      console.log(title, description, images);
      console.log(req.user);

      if (!title || !description || !images) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newBlog = new About({ title, description, images });
      const savedBlog = await newBlog.save();

      res.status(201).json({
        message: "Blog added successfully",
        blog: savedBlog,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding blog", error: error.message });
    }
  }
};

// Delete a blog by ID
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await About.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Blog deleted successfully",
      blog: deletedBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting blog", error: error.message });
  }
};

// Edit and update a blog by ID
const editAndUpdateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, images } = req.body;

    const updatedBlog = await About.findByIdAndUpdate(
      id,
      {
        title,
        description,
        images,
        updatedAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating blog", error: error.message });
  }
};

module.exports = { addBlog, deleteBlog, editAndUpdateBlog };
