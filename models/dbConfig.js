const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url)
    .then(() => {
        logger.info('Iskcon DB Connected...');
    })
    .catch((err) => {
        logger.info('Iskcon DB Connection Error...')
    }); 