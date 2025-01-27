const Media = require("../models/media");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { logger } = require("../utils/logger");

// this controller is for creating media
exports.createMedias = async (req, res) => {
    try {
        const { title, type } = req.body;

        // validating the data 
        if (!title || !type || !req.files?.image[0] || req.files.image.length === 0) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (let i = 0; i < req.files.image.length; i++) {
            const image = req.files.image[i];
            const cloudinaryResponse = await uploadOnCloudinary(image.path);
            imageUrls.push(cloudinaryResponse.secure_url); // Store Cloudinary URL of the uploaded image
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
        logger.info(`Media Created`);
        // return response
        return res.status(201).json({ message: "Media created successfully" });
    } catch (error) {
        logger.error(`Error on Creating Media :`,error);
        return res.statsu(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the medias
exports.getAllMedias = async (req, res) => {
    try {
        const medias = await Media.find();

        // checking if Media is found
        if (!medias) {
            logger.warn(`Media not found`);
            return res.status(500).json({ message: "Medias not found" });
        }
        logger.info(`Media Found`);
        // return response
        return res.status(200).json({ data: medias });

    } catch (error) {
        logger.error(`Error on Getting Medias`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting a single media
exports.getSingleMedia = async (req, res) => {
    try {
        const { mediaId } = req.params

        // checking if media id is provided or not
        if (!mediaId) {
            logger.warn('Media is Required');
            return res.status(400).json({ message: "Media Id is required" });
        }

        // getting single media
        const singleMedia = await Media.findById(mediaId);

        // checking if media is found
        if (!singleMedia) {
            logger.warn('Media is Required');
            return res.status(500).json({ message: "Media not found" });
        }

        // return response
        return res.status(200).json({ data: singleMedia });
    } catch (error) {
        logger.error(`Error on Fetching Single Media at ${mediaId}`);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a media
exports.deleteMedia = async (req, res) => {
    try {
        const { mediaId } = req.body

        // checking if media id is provided or not
        if (!mediaId) {
            logger.warn(`Media Id is not found`);
            return res.status(400).json({ message: "Media Id is required" });
        }

        // deleting media
        const deletedMedia = await Media.findByIdAndDelete(mediaId);

        // checking if media is deleted
        if (!deletedMedia) {
            logger.warn(`Media is not found to be deleted`);
            return res.status(500).json({ message: "Media not found" });
        }
        logger.info(`Media Deletion Successful`);
        // return response
        return res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
        logger.error(`Media Deletion Error`,error);
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
            logger.warn(`MediaId is Required`);
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
            logger.warn(`Updated Media is Required`);
            return res.status(500).json({ message: "Media not found" });
        }
        logger.info(`Editing Media Successful`);
        // return response
        return res.status(200).json({ message: "Media updated successfully" });

    } catch (error) {
        logger.error(`Error on Editing Media`,error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}