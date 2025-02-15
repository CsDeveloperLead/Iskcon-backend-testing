const LiveDarshan = require("../models/liveDarshan");
const moment = require('moment-timezone');

exports.createLiveDarshan = async (req, res) => {
    try {
        const { LiveDarshanLink } = req.body

        if (!LiveDarshanLink) {
            return res.status(400).json({ message: "Live Darshan Link is required" })
        }

        const liveDarshan = await LiveDarshan.create({ youtubeLiveLink: LiveDarshanLink })

        if (!liveDarshan) {
            return res.status(404).json({ message: "Live Darshan not created" })
        }

        return res.status(200).json({ message: "Live Darshan created successfully", liveDarshan })

    } catch (error) {
        console.log("Error creating live darshan", error);
    }
}

exports.getAllLiveDarshan = async (req, res) => {
    try {
        const liveDarshan = await LiveDarshan.find().lean()

        return res.status(200).json({ liveDarshan })

    } catch (error) {
        console.log("Error getting live darshan", error);
    }
}

exports.getLiveDarshanByDate = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        // Construct start and end date strings for IST
        const startOfDay = moment.tz(date, 'DD-MM-YYYY', 'Asia/Kolkata').startOf('day').format('DD-MM-YYYY HH:mm:ss');
        const endOfDay = moment.tz(date, 'DD-MM-YYYY', 'Asia/Kolkata').endOf('day').format('DD-MM-YYYY HH:mm:ss');

        // Query based on string comparison
        const liveDarshan = await LiveDarshan.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        if (!liveDarshan || liveDarshan.length === 0) {
            return res.status(404).json({ message: "Live Darshan not found" });
        }

        return res.status(200).json({ liveDarshan: liveDarshan[0] });
    } catch (error) {
        console.error("Error getting live darshan", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteLiveDarshan = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Live Darshan Id is required" })
        }

        const deleteLiveDarshan = await LiveDarshan.findByIdAndDelete(id).lean()

        if (!deleteLiveDarshan) {
            return res.status(404).json({ message: "Live Darshan not found" })
        }

        return res.status(200).json({ message: "Live Darshan deleted successfully" });

    } catch (error) {
        console.log("Error while deleting live darshan", error);
    }
}