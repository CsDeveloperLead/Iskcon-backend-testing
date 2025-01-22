const Donate = require("../models/csrdonation");
const { uploadOnCloudinary } = require("../utils/cloudinary");

exports.createCSRDonation = async (req, res) => {
    try {
        const { title, description, totalAmount, startDate, endDate } = req.body;

        // Validate required fields
        if (!title || !description || !totalAmount || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate file upload
        if (!req.files || !req.files.image || !req.files.image[0]) {
            return res.status(400).json({ message: "Image file is required." });
        }

        // Upload image to Cloudinary
        const imageUrl = await uploadOnCloudinary(req.files.image[0].path);
        console.log(imageUrl);
 
        // Create the CSR donation
        const csrDonation = await Donate.create({
            title,
            description,
            image: imageUrl.secure_url,
            totalAmount,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });

        // Send success response
        res.status(201).json({
            message: "CSR Donation created successfully.",
            csrDonation,
        });
    } catch (error) {
        console.error("Error creating CSR Donation:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllCSRDonations = async (req, res) => {
    try {
        const csrDonations = await Donate.find();
        res.status(200).json(csrDonations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getSingleCSRDonation = async (req, res) => {
    const { id } = req.params;
    try {
        const csrDonation = await Donate.findById(id);
        if (!csrDonation) {
            return res.status(404).json({ message: "CSR Donation not found" });
        }
        res.status(200).json(csrDonation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateCSRDonation = async (req, res) => {
    const { id } = req.params;
    const { title, description, image, totalAmount, startDate, endDate } = req.body;
    try {
        const csrDonation = await Donate.findById(id);
        if (!csrDonation) {
            return res.status(404).json({ message: "CSR Donation not found" });
        }
        csrDonation.title = title;
        csrDonation.description = description;
        csrDonation.image = image;
        csrDonation.totalAmount = totalAmount;
        csrDonation.startDate = startDate;
        csrDonation.endDate = endDate;
        await csrDonation.save();
        res.status(200).json(csrDonation);
    } catch (error) {   
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }   
};

exports.deleteCSRDonation = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    try {
        const csrDonation = await Donate.findById(id);
        if (!csrDonation) {
            return res.status(404).json({ message: "CSR Donation not found" });
        }
        await csrDonation.remove();
        res.status(204).json({ message: "CSR Donation deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
