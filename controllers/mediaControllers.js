const Media = require("../models/media");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const moment = require("moment-timezone");

// this controller is for creating media
exports.createMedias = async (req, res) => {
    try {
        const { title, type } = req.body;

        // validating the data 
        if (!title || !type || !req.files || req.files.length === 0) {
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


        // creating media
        const media = await Media.create(
            {
                title,
                type,
                image: imageUrls
            }
        )

        // checking if media is created or not
        if (!media) {
            return res.status(500).json({ message: "Media not created" });
        }

        // return response
        return res.status(201).json({ message: "Media created successfully" });
    } catch (error) {
        return res.statsu(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the medias
exports.getAllMedias = async (req, res) => {
    try {
        const medias = await Media.find();

        // checking if Media is found
        if (!medias) {
            return res.status(500).json({ message: "Medias not found" });
        }

        // return response
        return res.status(200).json({ data: medias });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// get media as per date
exports.getMediaAsPerDate = async (req, res) => {
    try {
        const { date } = req.body; // Example: "Fri Feb 14 2025 17:47:02 GMT+0530 (India Standard Time)"

        console.log(date)

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        // Convert incoming date to the same format as stored in DB (DD-MM-YYYY)
        const formattedDate = moment(new Date(date)).format("DD-MM-YYYY");

        console.log(formattedDate)

        // Fetch media where createdAt matches the formatted date
        const medias = await Media.find({
            createdAt: { $regex: `^${formattedDate}` } // Match only the date part
        });

        // Return response
        return res.status(200).json({ data: medias });

    } catch (error) {
        console.error("Error fetching media:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// this controller is for getting a single media
exports.getSingleMedia = async (req, res) => {
    try {
        const { mediaId } = req.params

        // checking if media id is provided or not
        if (!mediaId) {
            return res.status(400).json({ message: "Media Id is required" });
        }

        // getting single media
        const singleMedia = await Media.findById(mediaId);

        // checking if media is found
        if (!singleMedia) {
            return res.status(500).json({ message: "Media not found" });
        }

        // return response
        return res.status(200).json({ data: singleMedia });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a media
exports.deleteMedia = async (req, res) => {
    try {
        const { mediaId } = req.body

        console.log(mediaId)
        // checking if media id is provided or not
        if (!mediaId) {
            return res.status(400).json({ message: "Media Id is required" });
        }

        // deleting media
        const deletedMedia = await Media.findByIdAndDelete(mediaId);

        // checking if media is deleted
        if (!deletedMedia) {
            return res.status(500).json({ message: "Media not found" });
        }

        // return response
        return res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for editing a media
exports.editMedia = async (req, res) => {
    try {
        const { title, type } = req.body
        const { mediaId } = req.params

        // checking if media id is provided or not
        if (!mediaId) {
            return res.status(400).json({ message: "Media Id is required" });
        }

        const updated = {}

        if (title) updated.title = title
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
        if (type) updated.type = type

        // updating media
        const updatedMedia = await Media.findByIdAndUpdate(mediaId,
            updated,
            { new: true }
        );

        // checking if media is updated
        if (!updatedMedia) {
            return res.status(500).json({ message: "Media not found" });
        }

        // return response
        return res.status(200).json({ message: "Media updated successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}