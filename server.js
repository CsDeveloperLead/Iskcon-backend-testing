
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const moment =  require('moment-timezone');
const os = require('os');
const { NODE_ENV = 'LOCAL' } = process.env;
const configModel = require('./models/configModel');
const {logger} = require('./utils/logger');

require('dotenv').config();
const mongo_url = process.env.MONGO_CONN;

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongo_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // logger.debug('Connected to Iskcon MongoDB');
        // global['config'] = configModel.findOne({}).select('-_id').lean().exec();
        // HeartBeat Check
        // if (['UAT', 'PRODUCTION'].includes(NODE_ENV.toUpperCase())) {
        //     const configStream = configModel.watch();

        //     configStream.on('change', async () => {
        //         try {
        //             // Fetch the configuration from the database
        //             global['config'] = await configModel.findOne({}).select('-_id').lean().exec();
            
        //             // Log success message with the host's name
        //            logger.debug(`Config Set Successfully on Host ${os.hostname()}`);
        //         } catch (error) {
        //             logger.error('Error setting config:', error);
        //         }
        //     });
            
        // }
        logger.debug('Hello')
        require('./app');
    } catch (err) {
        console.log(err);
        logger.error('Error connecting to Iskcon MongoDB:', err);
    }
};

connectToMongoDB();

mongoose.set('debug', process.env.NODE_ENV !== 'production');
