// const moment = require('moment-timezone');
// const mongoose = require('mongoose');

// const noOfDaysSchema = new mongoose.Schema(
//     {
//         past: { type: Number, default: 604800, required: true },
//         future: { type: Number, default: 604800, required: true },
//     }
// );

// const capacityAlertSchema = new mongoose.Schema({
//     enabled: { type: Boolean, required: true },
//     alertAfter: { type: Number, required: true },
// });

// const emailSchema = new mongoose.Schema({
//     cronJobSummary: {
//         enabled: { type: Boolean, required: true },
//         toEmails: { type: [String], required: true, default: [] },
//     },
// });

// const configSchema =new mongoose.Schema({
//     noOfDaysOrderHistory: noOfDaysSchema,
//     orderExpiryTime: { type: Number, required: true },
//     emailSummaryExpiryTime: { type: Number },
//     capacityRange: {
//         '1': { type: Number, required: true },
//         '2': { type: Number, required: true },
//         '3': { type: Number, required: true },
//     },
//     capacityAlert: {
//         slot: capacityAlertSchema,
//     },
//     coreAPIControls: {
//         disable: { type: Number, required: true, default: false },
//     },
//     byPassKey: { type: String },
//     range: {

//     },
//     emails: {
//         required: true,
//         type: emailSchema,
//     }
// },
// {
//     timestamps: { currentTime: () => new Date(moment().tz("Asia/Kolkata").format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z') },
// }
// );

// module.exports.Config = mongoose.model('Config', configSchema);


