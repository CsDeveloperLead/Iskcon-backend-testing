const Event = require("../models/events");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// this controller is for creating event
exports.createEvents = async (req, res) => {
    try {
        const { title, description, startDate, endDate, location } = req.body;

        // validating the data 
        if (!title || !description || !req.files || !startDate || !endDate || !location || req.files?.length === 0) {
            logger.warn(`One or more fields are missing for creating events`);
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (const file of req.files) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(file.path);
                imageUrls.push(cloudinaryResponse.secure_url);
                logger.info(`Image Uploaded Successfully`);
            } catch (uploadError) {
                logger.warn(`Image Upload Failed`);
                return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
            }
        }

        // creating Event
        const event = await Event.create(
            {
                title,
                description,
                image: imageUrls,
                startDate,
                endDate,
                location
            }
        )

        // checking if Event is created or not
        if (!event) {
            logger.warn(`Event Not Created`);
            return res.status(500).json({ message: "Event not created" });
        }
        logger.info(`Event Created Successfully`);
        // return response
        return res.status(201).json({ message: "Event created successfully" });
    } catch (error) {
        logger.info(error);

        // return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({}, "title image startDate description endDate location").lean();

        // checking if events are found
        if (!events) {
            logger.warn(`Events not Found`);
            return res.status(500).json({ message: "Events not found" });
        }

        // return response
        return res.status(200).json({ data: events });

    } catch (error) {
        logger.error(`Error On Getting All Events`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for get a single event
exports.getSingleEvent = async (req, res) => {
    try {
        const { eventId } = req.params

        // checking if event id is provided or not
        if (!eventId) {
            logger.warn(`Event Id is Required`);
            return res.status(400).json({ message: "Event Id is required" });
        }

        // getting single event
        const singleEvent = await Event.findById(eventId, "title description image startDate endDate location createdAt").lean()

        // checking if event is found
        if (!singleEvent) {
            return res.status(500).json({ message: "Event not found" });
        }

        // return response
        return res.status(200).json({ data: singleEvent });
    } catch (error) {
        logger.error(`Error fetching Single Event`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting an event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params

        // checking if event id is provided or not
        if (!eventId) {
            return res.status(400).json({ message: "Event Id is required" });
        }

        // deleting event
        const deletedEvent = await Event.findByIdAndDelete(eventId).lean()

        // checking if event is deleted
        if (!deletedEvent) {
            return res.status(500).json({ message: "Event not found" });
        }
        logger.info(`Event Deleted`);
        // return response
        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        logger.error(`Error in Deleting Event`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for updating an event
exports.editEvent = async (req, res) => {
    try {
        const { title, description, startDate, endDate, location } = req.body
        let { previousImages } = req.body;
        const { eventId } = req.params

        // checking if event id is provided or not
        if (!eventId) {
            return res.status(400).json({ message: "Event Id is required" });
        }

        // Ensure previousImages is an array
        if (previousImages && typeof previousImages === "string") {
            try {
                previousImages = JSON.parse(previousImages); // Convert stringified array to actual array
            } catch (err) {
                return res.status(400).json({ message: "Invalid format for previousImages" });
            }
        }

        const updated = {}

        if (title) updated.title = title
        if (description) updated.description = description
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
        if (startDate) updated.startDate = startDate
        if (endDate) updated.endDate = endDate
        if (location) updated.location = location

        // updating event
        const updatedEvent = await Event.findByIdAndUpdate(eventId,
            updated,
            { new: true, lean: true }
        );

        // checking if Event is updated
        if (!updatedEvent) {
            return res.status(500).json({ message: "Event not found" });
        }
        logger.info(`Event Edited`);
        // return response
        return res.status(200).json({ message: "Event updated successfully" });

    } catch (error) {
        logger.error(`Error on Editing Event`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}