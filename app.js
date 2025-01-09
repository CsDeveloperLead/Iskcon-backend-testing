const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();
require('./models/dbConfig');

const verifyHMAC = require('./middlewares/auth');
const authRoutes = require('./routes/authRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const productRoutes = require('./routes/productRoutes');

const PORT = process.env.PORT || 8080;

// const corsOptions = {
//     origin: ['http://localhost:3000', 'http://localhost:8080'], // allowed these origin only
//     credentials: true // // Allow cookies and credentials from the request
// }

// Dynamic Origin handling
// const corsOptions = {
//     origin: function(origin, callback){
//         const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080'];
//         if(!origin || allowedOrigins.indexOf(origin) !== -1){
//             callback(null, true); // Allow the origin
//         }else{
//             callback(new Error('Origin not allowed by Cors'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(cors(corsOptions));
// app.use(router);
app.use('/api/auth', authRoutes);
app.use('/about', aboutRoutes);
app.use('/product', productRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


