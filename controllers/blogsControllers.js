const Blog = require("../models/blogs");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// this controller is for creating blog
exports.createBlogs = async (req, res) => {
    try {
        const { title, description } = req.body;
        console.log("title || !description || !req.files || req.files.length ->", title , description, req.files, req.files.length)

        // validating the data 
        if (!title || !description || !req.files || req.files.length === 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (const file of req.files) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(file.path);
                imageUrls.push(cloudinaryResponse.secure_url);
            } catch (uploadError) {
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        // creating blog
        const blog = await Blog.create(
            {
                title,
                description,
                image: imageUrls
            }
        )

        // checking if blog is created or not
        if (!blog) {
            return res.status(500).json({ message: "Blog not created" });
        }

        // return response
        return res.status(201).json({ message: "Blog created successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the blogs
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}, "title author image description createdAt").lean(); //  lean is used for optimization

        // checking if blog is found
        if (!blogs) {
            return res.status(500).json({ message: "Blogs not found" });
        }

        // return response
        return res.status(200).json({ data: blogs });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting a single blog
exports.getSingleBlog = async (req, res) => {
    try {
        const { blogId } = req.params

        // checking if blog id is provided or not
        if (!blogId) {
            return res.status(400).json({ message: "Blog Id is required" });
        }

        // getting single blog
        const singleBlog = await Blog.findById(blogId, "title description author image createdAt").lean();

        // checking if blog is found
        if (!singleBlog) {
            return res.status(500).json({ message: "Blog not found" });
        }

        // return response
        return res.status(200).json({ data: singleBlog });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a blog
exports.deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params

        // checking if blog id is provided or not
        if (!blogId) {
            return res.status(400).json({ message: "Blog Id is required" });
        }

        // deleting blog
        const deletedBlog = await Blog.findByIdAndDelete(blogId).lean();

        // checking if blog is deleted
        if (!deletedBlog) {
            return res.status(500).json({ message: "Blog not found" });
        }

        // return response
        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for editing a blog
exports.editBlog = async (req, res) => {
    try {
        const { title, description } = req.body;
        let { previousImages } = req.body;
        const { blogId } = req.params;

        // Check if blogId is provided
        if (!blogId) {
            return res.status(400).json({ message: "Blog Id is required" });
        }

        // Ensure previousImages is an array
        if (previousImages && typeof previousImages === "string") {
            try {
                previousImages = JSON.parse(previousImages); // Convert stringified array to actual array
            } catch (err) {
                return res.status(400).json({ message: "Invalid format for previousImages" });
            }
        }

        const updated = {};

        // Update title and description if provided
        if (title) updated.title = title;
        if (description) updated.description = description;

        // Handle image update if new images are uploaded
        if (req.files) {
            const newImages = [...previousImages];

            // Loop through the uploaded images
            for (const file of req.files) {
                try {
                    const cloudinaryResponse = await uploadOnCloudinary(file.path);
                    newImages.push(cloudinaryResponse.secure_url);
                } catch (uploadError) {
                    return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
                }
            }
            // Update the images field with new images (replace the old ones)
            updated.image = newImages; // Assuming you want to replace all images
        }

        // Update the blog in the database
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, updated, { new: true, lean: true });

        // Check if the blog was updated
        if (!updatedBlog) {
            return res.status(500).json({ message: "Blog not found" });
        }

        // Return success response
        return res.status(200).json({ message: "Blog updated successfully", updatedBlog });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};