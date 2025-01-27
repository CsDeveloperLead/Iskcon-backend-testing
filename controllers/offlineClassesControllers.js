const { uploadOnCloudinary } = require("../utils/cloudinary");
const OfflineClasses = require("../models/offlineClasses");


// this controller is for creating Offline classes
exports.createOfflineClasses = async (req, res) => {
   
    try {
        const { title, description, timings, location, classesDays } = req.body;

        logger.info(req.body)

        // validating the data 
        if (!title || !description || !req.files || !timings || !location || !classesDays || req.files?.length === 0) {
            logger.warn(`Fields are Required`);
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (const file of req.files) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(file.path);
                imageUrls.push(cloudinaryResponse.secure_url);
            } catch (uploadError) {
                logger.error(`Upload Error`,error);
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        
        const classes = new OfflineClasses(
            {
                title,
                description,
                timings,
                location,
                classesDays,
            }
        )
        await classes.save()
        logger.info(classes)
        logger.info('classes')

        // checking if blog is created or not
        if (!classes) {
            logger.warn(`Classes are Required`);
            return res.status(500).json({ message: "Classes not created" });
        }

        // return response
        return res.status(201).json({ message: "Classes created successfully" });
    } catch (error) {
        logger.info(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the Offline classes
exports.getClasses = async (req, res) => {
    try {
        const classes = await OfflineClasses.find({}, "title image description timings location classesDays").lean(); //  lean is used for optimization

        // checking if classes is found
        if (!classes) {
            logger.warn(`Classes are Required`);
            return res.status(500).json({ message: "Classes not found" });
        }
        logger.info(`Fetching Classes Successful`);
        // return response
        return res.status(200).json({ data: classes });

    } catch (error) {
        logger.error(`Error on fetching Class`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting a single class
exports.getSingleClass = async (req, res) => {
    try {
        const { classId } = req.params

        // checking if class id is provided or not
        if (!classId) {
            logger.warn(`ClassId is Required`);
            return res.status(400).json({ message: "Class Id is required" });
        }

        // getting single class
        const singleClass = await OfflineClasses.findById(classId, "title description image timings location classesDays").lean();

        // checking if Class is found
        if (!singleClass) {
            logger.warn(`Single Class is Required`);
            return res.status(500).json({ message: "Class not found" });
        }

        logger.info(`Fetching Single Class Successful`);
        // return response
        return res.status(200).json({ data: singleClass });
    } catch (error) {
        logger.error(`Error on Fetching Single Class`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a Class
exports.deleteClass = async (req, res) => {
    try {
        const { classId } = req.body

        // checking if Class id is provided or not
        if (!classId) {
            logger.warn(`ClassId is Required`);
            return res.status(400).json({ message: "Class Id is required" });
        }

        // deleting class
        const deletedClass = await OfflineClasses.findByIdAndDelete(classId).lean();

        // checking if Class is deleted
        if (!deletedClass) {
            logger.warn(`Class is not Found`);
            return res.status(500).json({ message: "Class not found" });
        }
        logger.info(`Deleting Class Successful`);
        // return response
        return res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
        logger.error(`Error on Deleting Class`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for editing a class
exports.editClass = async (req, res) => {
    try {
        const { title, description , timings, location , classesDays } = req.body;
        const { classId } = req.params;

        // Check if ClassId is provided
        if (!classId) {
            logger.warn(`Class Id is Required`);
            return res.status(400).json({ message: "Class Id is required" });
        }

        const updated = {};

        // Update title and description if provided
        if (title) updated.title = title;
        if (description) updated.description = description;
        if (timings) updated.timings = timings;
        if (location) updated.location = location;
        if (classesDays) updated.classesDays = classesDays;

        // Handle image update if new images are uploaded
        if (req.files?.image) {
            const newImages = [];

            // Loop through the uploaded images
            for (let i = 0; i < req.files.image.length; i++) {
                const image = req.files.image[i];

                // Upload each image to Cloudinary
                const cloudinaryResponse = await uploadOnCloudinary(image.path);
                newImages.push(cloudinaryResponse.secure_url); // Store the Cloudinary URL for each image
            }

            // Update the images field with new images (replace the old ones)
            updated.image = newImages; // Assuming you want to replace all images
        }

        // Update the Class in the database
        const updatedClass = await OfflineClasses.findByIdAndUpdate(classId, updated, { new: true, lean: true });

        // Check if the Class was updated
        if (!updatedClass) {
            logger.warn(`Classes are Required`);
            return res.status(500).json({ message: "Class not found" });
        }
        logger.info(`Editing Class Successful`);
        // Return success response
        return res.status(200).json({ message: "Class updated successfully", updatedClass });

    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};