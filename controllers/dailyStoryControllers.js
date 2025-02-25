const DailyStory = require("../models/dailyStory");
const moment = require("moment-timezone");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createStory = async (req, res) => {
    try {
        const { title, description, type } = req.body;

        console.log(req.files);
        console.log(req.files[0]);
        console.log(req.files[0].path);
        // Validate input
        if (!title || !description || !type || !req.files || !req.files[0]) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Upload media to Cloudinary
        const cloudinaryResponse = await uploadOnCloudinary(req.files[0].path);
        if (!cloudinaryResponse?.secure_url) {
            return res.status(500).json({ message: 'Image upload failed' });
        }

        // Create and save story
        const newStory = new DailyStory({
            title,
            description,
            type,
            media: cloudinaryResponse.secure_url,
        });

        await newStory.save();

        res.status(201).json({
            message: 'Daily story created successfully!',
            data: newStory,
        });
    } catch (error) {
        console.error('Error creating daily story:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


exports.getAllStory = async (req, res) => {
    try {
        const stories = await DailyStory.find().lean();
        return res.status(200).json({ story: stories }); // Ensure consistency in key name
      } catch (error) {
        console.error("Error getting All Story", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
}

exports.getStoryByDate = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        // Construct start and end date strings for IST
        const startOfDay = moment.tz(date, 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').format('DD-MM-YYYY HH:mm:ss');
        const endOfDay = moment.tz(date, 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').format('DD-MM-YYYY HH:mm:ss');

        // Query based on string comparison
        const story = await DailyStory.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        if (!story || story.length === 0) {
            return res.status(404).json({ message: "Story not found" });
        }

        return res.status(200).json({ story: story[0] });
    } catch (error) {
        console.error("Error getting Story", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteStory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Story Id is required" })
        }

        const deletedStory = await DailyStory.findByIdAndDelete(id).lean()

        if (!deletedStory) {
            return res.status(404).json({ message: "Story not found" })
        }

        return res.status(200).json({ message: "Story deleted successfully" });

    } catch (error) {
        console.log("Error while deleting Story", error);
    }
}

exports.updateStory = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type } = req.body;
        let media;

        const existingStory = await DailyStory.findById(id);
        if (!existingStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (req.files && req.files[0]) {
            const cloudinaryResponse = await uploadOnCloudinary(req.files[0].path);
            if (!cloudinaryResponse?.secure_url) {
                return res.status(500).json({ message: 'Image upload failed' });
            }
            media = cloudinaryResponse.secure_url;
        }

        existingStory.title = title || existingStory.title;
        existingStory.description = description || existingStory.description;
        existingStory.type = type || existingStory.type;
        existingStory.media = media || existingStory.media;
        existingStory.updatedAt = moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss");

        await existingStory.save();

        res.status(200).json({
            message: 'Daily story updated successfully!',
            data: existingStory,
        });
    } catch (error) {
        console.error('Error updating daily story:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
