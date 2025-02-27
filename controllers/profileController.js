

const moment = require("moment-timezone");
const Profile = require("../models/Profile");

exports.createOrUpdateProfile = async (req, res) => {
  console.log("Request body:", req.body);

  try {
    const { personalDetails, address, relationships, occasions, idProof } = req.body;

    // Validate required fields
    if (
      !personalDetails ||
      !personalDetails.name ||
      !personalDetails.email ||
      !personalDetails.mobile ||
      !personalDetails.dob ||
      !personalDetails.gender ||
      !address ||
      !address.address ||
      !address.country ||
      !address.state ||
      !address.pincode
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Format Dates
    const formattedDob = moment(personalDetails.dob, "YYYY-MM-DD").toDate();
    const formattedRelationships = relationships?.map((r) => ({
      ...r,
      dob: r.dob ? moment(r.dob, "YYYY-MM-DD").toDate() : null,
    }));

    const formattedOccasions = occasions?.map((o) => ({
      ...o,
      date: o.date ? moment(o.date, "YYYY-MM-DD").toDate() : null,
    }));

    // Query to find existing profile
    const query = { email: personalDetails.email };

    // Prepare the update object
    const update = {
      personalDetails: {
        name: personalDetails.name,
        email: personalDetails.email,
        mobile: personalDetails.mobile,
        whatsappNumber: personalDetails.whatsappNumber || "",
        dob: formattedDob,
        panNumber: personalDetails.panNumber || "",
        maritalStatus: personalDetails.maritalStatus || "",
        citizenType: personalDetails.citizenType || "Indian",
        gender: personalDetails.gender || "male",
      },
      address: {
        address: address.address,
        country: address.country,
        state: address.state,
        pincode: address.pincode,
      },
      relationships: formattedRelationships || [],
      occasions: formattedOccasions || [],
      idProof: {
        aadhaarNumber: idProof?.aadhaarNumber || "",
        drivingLicense: idProof?.drivingLicense || "",
        voterId: idProof?.voterId || "",
        otherId: idProof?.otherId || "",
      },
      updatedAt: moment().tz("Asia/Kolkata").format("DD-MM-YYYY HH:mm:ss"),
    };

    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    };

    // Find and update profile
    const profile = await Profile.findOneAndUpdate(query, update, options);

    res.status(200).json({ message: "Profile saved/updated successfully", profile });
  } catch (error) {
    console.error("Error saving/updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
