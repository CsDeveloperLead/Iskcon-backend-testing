const DailyStory = require("../models/dailyStory");
const moment = require("moment-timezone");
const { uploadOnCloudinary } = require("../utils/cloudinary");


exports.createStory = async (req, res) => {
    try {
        const { titles, descriptions ,types } = req.body;
        const files = req.files;

        // Validate input
        if (!titles || !descriptions || !types || files.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const titleArray = Array.isArray(titles) ? titles : [titles];
        const descriptionArray = Array.isArray(descriptions) ? descriptions : [descriptions];
        const typeArray = Array.isArray(types) ? types : [types];

        // Ensure all fields have the correct length
        if (titleArray.length !== descriptionArray.length || titleArray.length !== files.length) {
            return res.status(400).json({ message: 'Mismatch between titles, descriptions, and files' });
        }

        // Prepare stories
        const uploadPromises = files.map((file, index) => {
            const title = titleArray[index];
            const description = descriptionArray[index];
            const type = typeArray[index];

            if (!title || !description || !type) {
                throw new Error(`Missing title or description for story ${index + 1}`);
            }

            return uploadOnCloudinary(file.path).then((cloudinaryResponse) => ({
                title,
                description,
                type,
                media: cloudinaryResponse?.secure_url,
            }));
        });

        // Wait for all uploads to finish
        const stories = await Promise.all(uploadPromises);

        // Check for failed uploads
        const invalidStories = stories.filter((story) => !story.media);
        if (invalidStories.length > 0) {
            return res.status(500).json({ message: 'One or more images failed to upload' });
        }

        // Save stories to database
        const newDailyStory = await DailyStory.create({ story: stories });

        res.status(201).json({
            message: 'Daily stories created successfully!',
            data: newDailyStory,
        });
    } catch (error) {
        console.error('Error creating daily stories:', error);
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