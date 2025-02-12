const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;

mongoose.connect(mongo_url)
    .then(() => {
        console.log('Iskcon DB Connected...');
    })
    .catch((err) => {
        console.log('Iskcon DB Connection Error...')
    }); 