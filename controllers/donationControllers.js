const Donate = require("../models/donation");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// this controller is for creating donation
exports.createDonation = async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            donationsCategory, // Directly an array
        } = req.body;

        // Validate required fields
        if (!title || !description || !startDate || !endDate || !donationsCategory) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate donationsCategory
        if (!Array.isArray(donationsCategory) || donationsCategory.length === 0) {
            return res.status(400).json({ message: "donationsCategory must be a non-empty array." });
        }

        // Validate each donationsCategory and its donationTypes
        for (const category of donationsCategory) {
            if (!category.title || !Array.isArray(category.donationTypes) || category.donationTypes.length === 0) {
                return res.status(400).json({
                    message: "Each category must have a title and at least one donation type.",
                });
            }

            for (const type of category.donationTypes) {
                if (!type.title || type.amount == null || isNaN(type.amount)) {
                    return res.status(400).json({
                        message: "Each donation type must have a title and a valid amount.",
                    });
                }
            }
        }

        // Validate images
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." });
        }

        // Upload images to Cloudinary
        const imageUrls = [];
        for (const file of req.files) {
            try {
                const cloudinaryResponse = await uploadOnCloudinary(file.path);
                imageUrls.push(cloudinaryResponse.secure_url);
            } catch (uploadError) {
                return res.status(500).json({
                    message: "Failed to upload images.",
                    error: uploadError.message,
                });
            }
        }

        // Create a new donation record
        const newDonation = new Donate({
            title,
            description,
            image: imageUrls,
            startDate,
            endDate,
            donationsCategory,
        });

        // Save to database
        await newDonation.save();

        return res.status(201).json({
            message: "Donation created successfully.",
            donation: newDonation,
        });
    } catch (error) {
        console.error("Error creating donation:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// this controller is for getting all donations
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donate.find({}, "title image startDate donationsCategory endDate description").lean()

        // checking if donations are found
        if (!donations) {
            return res.status(500).json({ message: "Donations not found" });
        }

        // return response
        return res.status(200).json({ data: donations });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.getSingleDonations = async (req, res) => {
    try {
        const { donationId } = req.params

        // checking if donationId is provided
        if (!donationId) {
            return res.status(400).json({ message: "Donation Id is required" });
        }

        // finding single donation
        const singleDonation = await Donate.findById(donationId, "title description image startDate endDate donationsCategory createdAt").lean()

        // checking if donation is found
        if (!singleDonation) {
            return res.status(500).json({ message: "Donation not found" });
        }

        // return response
        return res.status(200).json({ data: singleDonation });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.deleteDonation = async (req, res) => {
    try {
        const { donationId } = req.params

        // checking if donationId is provided
        if (!donationId) {
            return res.status(400).json({ message: "Donation Id is required" });
        }

        // deleting donation
        const deletedDonation = await Donate.findByIdAndDelete(donationId).lean();

        // checking if donation is deleted
        if (!deletedDonation) {
            return res.status(500).json({ message: "Donation not found" });
        }

        // return response
        return res.status(200).json({ message: "Donation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.updateDonation = async (req, res) => {
    try {
        const {
            title,
            description,
            startDate,
            endDate,
            donationsCategory, // Directly getting donationsCategory
            existingImages,    // For preserving existing images
        } = req.body;

        // Log extracted data for debugging
        console.log(title, description, startDate, endDate, donationsCategory, existingImages);

        // Validate required fields
        if (!title || !description || !startDate || !endDate || !donationsCategory || donationsCategory.length === 0) {
            return res.status(400).json({ message: "All fields are required." });
        }

        donationsCategory.forEach((category, categoryIndex) => {
            if (!category.title || !category.donationTypes || category.donationTypes.length === 0) {
                return res.status(400).json({ message: `Category at index ${categoryIndex} must have a title and at least one donation type.` });
            }

            category.donationTypes.forEach((type, typeIndex) => {
                if (!type.title || !type.amount) {
                    return res.status(400).json({ message: `Donation type at category ${categoryIndex}, type ${typeIndex} must have a title and an amount.` });
                }
            });
        });

        // Handle image upload (if files are provided)
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Assuming you're uploading images to Cloudinary or another cloud service
            for (const file of req.files) {
                try {
                    const cloudinaryResponse = await uploadOnCloudinary(file.path); // Implement your upload logic
                    imageUrls.push(cloudinaryResponse.secure_url);
                } catch (uploadError) {
                    return res.status(500).json({
                        message: "Failed to upload images.",
                        error: uploadError.message,
                    });
                }
            }
        } else {
            imageUrls = existingImages || []; // Preserve existing images if no new images are uploaded
        }

        // Find the donation by ID and update it
        const donationId = req.params.donationId;
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Update the donation fields
        donation.title = title || donation.title;
        donation.description = description || donation.description;
        donation.startDate = startDate || donation.startDate;
        donation.endDate = endDate || donation.endDate;
        donation.donationsCategory = donationsCategory || donation.donationsCategory;
        donation.image = imageUrls.length > 0 ? imageUrls : donation.image; // Update images if new ones are uploaded

        // Save the updated donation
        await donation.save();

        return res.status(200).json({
            message: "Donation updated successfully.",
            donation,
        });
    } catch (error) {
        console.error("Error updating donation:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
