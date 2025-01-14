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
            faqs,
            donationsCategory,
            accountDetails
        } = req.body; 

        // Check if images are provided
        if (!req.files || !req.files.image || req.files.image.length === 0) { // add third party like cloudinary to handle images
            return res.status(400).json({ message: "Image is required" });
        }

        // Parse JSON fields for arrays or objects (if sent as JSON strings)
        const parsedFaqs = JSON.parse(faqs);
        const parsedDonationsCategory = JSON.parse(donationsCategory);
        const parsedAccountDetails = JSON.parse(accountDetails);

        // Validation for required fields
        if (!title || !description || !startDate || !endDate || !parsedFaqs.length || !parsedDonationsCategory.length || !parsedAccountDetails) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate each FAQ object
        for (const faq of parsedFaqs) {
            if (!faq.question || !faq.answer) {
                return res.status(400).json({ message: "Each FAQ must have a question and answer" });
            }
        }

        // Validate each donation category and its types
        for (const category of parsedDonationsCategory) {
            if (!category.title || !category.donationTypes.length) {
                return res.status(400).json({ message: "Each donation category must have a title and at least one donation type" });
            }
            for (const type of category.donationTypes) {
                if (!type.title || !type.amount) {
                    return res.status(400).json({ message: "Each donation type must have a title and amount" });
                }
            }
        }

        // Validate account details
        const { accountName, accountNumber, bankName, ifscCode, branchName } = parsedAccountDetails;
        if (!accountName || !accountNumber || !bankName || !ifscCode || !branchName) {
            return res.status(400).json({ message: "Complete account details are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (let i = 0; i < req.files.image.length; i++) {
            const image = req.files.image[i];
            const cloudinaryResponse = await uploadOnCloudinary(image.path);
            imageUrls.push(cloudinaryResponse.secure_url); // Store Cloudinary URL of the uploaded image
        }

        // Create a new donation record
        const newDonation = new Donate({
            title,
            description,
            image: imageUrls,
            startDate,
            endDate,
            faqs: parsedFaqs,
            donationsCategory: parsedDonationsCategory,
            accountDetails: parsedAccountDetails
        });

        // Save the donation record to the database
        await newDonation.save();

        return res.status(201).json({ message: "Donation created successfully", donation: newDonation });
    } catch (error) {
        console.error("Error creating donation:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// this controller is for getting all donations
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donate.find({}, "title image startDate endDate").lean()

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
        const singleDonation = await Donate.findById(donationId,"title description image startDate endDate faqs donationsCategory accountDetails createdAt").lean()

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
