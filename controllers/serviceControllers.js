const Service = require("../models/services");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// this controller is for creating service
exports.createServices = async (req, res) => {
    try {
        const { title, description } = req.body;

        // validating the data 
        if (!title || !description || !req.files || req.files.length === 0) {
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


        // creating Service
        const service = await Service.create(
            {
                title,
                description,
                image: imageUrls
            }
        )

        // checking if service is created or not
        if (!service) {
            return res.status(500).json({ message: "Service not created" });
        }

        // return response
        return res.status(201).json({ message: "Service created successfully" });
    } catch (error) {
        return res.statsu(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting all the services
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find();

        // checking if Services is found
        if (!services) {
            return res.status(500).json({ message: "Services not found" });
        }

        // return response
        return res.status(200).json({ data: services });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for getting a single Service
exports.getSingleService = async (req, res) => {
    try {
        const { serviceId } = req.params

        // checking if service id is provided or not
        if (!serviceId) {
            return res.status(400).json({ message: "Service Id is required" });
        }

        // getting single service
        const singleService = await Service.findById(serviceId);

        // checking if service is found
        if (!singleService) {
            return res.status(500).json({ message: "Service not found" });
        }

        // return response
        return res.status(200).json({ data: singleService });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for deleting a service
exports.deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params

        // checking if Service id is provided or not
        if (!serviceId) {
            return res.status(400).json({ message: "Service Id is required" });
        }

        // deleting Service
        const deletedService = await Service.findByIdAndDelete(serviceId);

        // checking if service is deleted
        if (!deletedService) {
            return res.status(500).json({ message: "Service not found" });
        }

        // return response
        return res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// this controller is for editing a service
exports.editService = async (req, res) => {
    try {
        const { title, description } = req.body
        let { previousImages } = req.body;
        const { serviceId } = req.params

        // checking if service id is provided or not
        if (!serviceId) {
            return res.status(400).json({ message: "Service Id is required" });
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

        // updating service
        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            updated,
            { new: true }
        );

        // checking if service is updated
        if (!updatedService) {
            return res.status(500).json({ message: "Service not found" });
        }

        // return response
        return res.status(200).json({ message: "Service updated successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}