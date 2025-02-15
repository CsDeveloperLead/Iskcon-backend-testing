const Event = require("../models/events");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// this controller is for creating event
exports.createEvents = async (req, res) => {
    try {
        const { title, description, startDate, endDate, location } = req.body;

        // validating the data 
        if (!title || !description || !req.files || !startDate || !endDate || !location || req.files?.length === 0) {
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
            return res.status(500).json({ message: "Event not created" });
        }

        // return response
        return res.status(201).json({ message: "Event created successfully" });
    } catch (error) {
        console.log(error);

        // return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({}, "title image startDate description endDate location").lean();

        // checking if events are found
        if (!events) {
            return res.status(500).json({ message: "Events not found" });
        }

        // return response
        return res.status(200).json({ data: events });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for get a single event
exports.getSingleEvent = async (req, res) => {
    try {
        const { eventId } = req.params

        // checking if event id is provided or not
        if (!eventId) {
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

        // return response
        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
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

        // return response
        return res.status(200).json({ message: "Event updated successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}