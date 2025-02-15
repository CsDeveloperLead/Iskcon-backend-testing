const Guest = require("../models/guestHouse");
const { uploadOnCloudinary } = require("../utils/cloudinary");


exports.createHouseGuest = async (req, res) => {
    try {
        const { title, description, bookingNo, whatsAppNo, email, reservationTime, guestHouseLink } = req.body;

        if (!title || !description || !guestHouseLink || req.files.image.length === 0) {
            return res.status(400).json({ message: "Title, description and guestHouseLink are required" });
        }

        // Upload images to Cloudinary and get URLs
        const imageUrls = [];
        for (let i = 0; i < req.files.image.length; i++) {
            const image = req.files.image[i];
            const cloudinaryResponse = await uploadOnCloudinary(image.path);
            imageUrls.push(cloudinaryResponse.secure_url); // Store Cloudinary URL of the uploaded image
        }

        const guestHouse = await Guest.create({
            title,
            description,
            bookingNo: bookingNo || null,
            whatsAppNo: whatsAppNo || null,
            email: email || null,
            reservationTime: reservationTime || null,
            guestHouseLink,
            image: imageUrls
        });

        if (!guestHouse) {
            return res.status(500).json({ message: "GuestHouse not created" });
        }

        return res.status(201).json({ message: "GuestHouse created successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.getAllGuestHouses = async (req, res) => {
    try {
        const guestHouses = await Guest.find({}, "title description bookingNo whatsAppNo email reservationTime guestHouseLink image createdAt updatedAt").lean();

        if (!guestHouses) {
            return res.status(500).json({ message: "GuestHouses not found" });
        }

        return res.status(200).json({ data: guestHouses });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.deleteGuestHouse = async (req, res) => {
    try {
        const { guestHouseId } = req.body;

        if (!guestHouseId) {
            return res.status(400).json({ message: "GuestHouse Id is required" });
        }

        const deletedGuestHouse = await Guest.findByIdAndDelete(guestHouseId).lean()

        if (!deletedGuestHouse) {
            return res.status(500).json({ message: "GuestHouse not deleted" });
        }

        return res.status(200).json({ message: "GuestHouse deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.editGuestHouse = async (req, res) => {
    try {
        const { guestHouseId } = req.params;
        const { title, description, bookingNo, whatsAppNo, email, reservationTime, guestHouseLink } = req.body;

        if (!guestHouseId) {
            return res.status(400).json({ message: "GuestHouse Id is required" });
        }

        const updated = {}

        if (title) updated.title = title
        if (description) updated.description = description
        if (bookingNo) updated.bookingNo = bookingNo
        if (whatsAppNo) updated.whatsAppNo = whatsAppNo
        if (email) updated.email = email
        if (reservationTime) updated.reservationTime = reservationTime
        if (guestHouseLink) updated.guestHouseLink = guestHouseLink

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

        const updatedGuestHouse = await Guest.findByIdAndUpdate(guestHouseId,
            updated,
            { new: true, lean: true }
        );

        if (!updatedGuestHouse) {
            return res.status(500).json({ message: "GuestHouse not updated" });
        }

        return res.status(200).json({ message: "GuestHouse updated successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}