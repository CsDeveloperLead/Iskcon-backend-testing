const { uploadOnCloudinary } = require("../utils/cloudinary");
const OfflineClasses = require("../models/offlineClasses");


// this controller is for creating Offline classes
exports.createOfflineClasses = async (req, res) => {
   
    try {
        const { title, description, timings, location, classesDays } = req.body;


        // validating the data 
        if (!title || !description  || !timings || !location || !classesDays) {
            return res.status(400).json({ message: "All fields are required" });
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

        // checking if blog is created or not
        if (!classes) {
            return res.status(500).json({ message: "Classes not created" });
        }

        // return response
        return res.status(201).json({ message: "Classes created successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the Offline classes
exports.getClasses = async (req, res) => {
    try {
        const classes = await OfflineClasses.find({}, "title image description timings location classesDays").lean(); //  lean is used for optimization

        // checking if classes is found
        if (!classes) {
            return res.status(500).json({ message: "Classes not found" });
        }

        // return response
        return res.status(200).json({ data: classes });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting a single class
exports.getSingleClass = async (req, res) => {
    try {
        const { classId } = req.params

        // checking if class id is provided or not
        if (!classId) {
            return res.status(400).json({ message: "Class Id is required" });
        }

        // getting single class
        const singleClass = await OfflineClasses.findById(classId, "title description image timings location classesDays").lean();

        // checking if Class is found
        if (!singleClass) {
            return res.status(500).json({ message: "Class not found" });
        }

        // return response
        return res.status(200).json({ data: singleClass });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a Class
exports.deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;

        console.log(classId);

        // checking if Class id is provided or not
        if (!classId) {
            return res.status(400).json({ message: "Class Id is required" });
        }

        // deleting class
        const deletedClass = await OfflineClasses.findByIdAndDelete(classId).lean();

        // checking if Class is deleted
        if (!deletedClass) {
            return res.status(500).json({ message: "Class not found" });
        }

        // return response
        return res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
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
       
        // Update the Class in the database
        const updatedClass = await OfflineClasses.findByIdAndUpdate(classId, updated, { new: true, lean: true });

        // Check if the Class was updated
        if (!updatedClass) {
            return res.status(500).json({ message: "Class not found" });
        }

        // Return success response
        return res.status(200).json({ message: "Class updated successfully", updatedClass });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};