const base64 = require('base-64');
const utf8 = require('utf8');
// const logger = require('./logger.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');
const secretKeysPath = `../configs/authconfig-${(process.env.NODE_ENV).toLowerCase()}.json`;


logger.info("Logger is working")
if(!fs.existsSync(path.join(__dirname,secretKeysPath))){
	// logger.error("AuthConfig file not found. Stopping the Iskcon API");
	process.exit(1);
}
const tokenConfig = require(secretKeysPath);

const {jwtSecretKey, cryptoKey, jwtExpiresIn, cryptoAlgo, ivLength} = tokenConfig;

let crypto;

try{
    crypto = require('crypto');
}catch(err){
    logger.error('crypto support is disabled');
}

const encrypt = (data) => {
    let iv = crypto.randomBytes(ivLength);
	let cipher = crypto.createCipheriv(cryptoAlgo, Buffer.from(cryptoKey[0]), iv); // encrypt always with new Key
	let encrypted = cipher.update(data);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + encrypted.toString('hex');
}



exports.getEncodedCookie = function(payLoad){
	let token='';
	let payloadString = JSON.stringify(payLoad);

	let encrypted = encrypt(payloadString);
	if (jwtExpiresIn) {
		token = jwt.sign({
			info : encrypted,
			iat  : Math.floor(Date.now() / 1000)
		},
		jwtSecretKey[0],
		{ expiresIn : jwtExpiresIn }
		);
	} else {
		token = jwt.sign({info:encrypted}, jwtSecretKey[0]);
	}
	return token;
};

const decrypt = (encryptedData) => {
    try {
        // Extract the IV and encrypted text from the combined string
        const iv = Buffer.from(encryptedData.slice(0, ivLength * 2), 'hex');
        const encryptedText = Buffer.from(encryptedData.slice(ivLength * 2), 'hex');

        // Create a decipher object
        const decipher = crypto.createDecipheriv(cryptoAlgo, Buffer.from(cryptoKey[0]), iv);

        // Decrypt the data
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (err) {
        logger.error('Decryption failed:', err);
        throw new Error('Failed to decrypt data');
    }
};


exports.getdecodeToken = (token) => {
	
    try {
        // Verify the JWT and extract the payload
        const decoded = jwt.verify(token, jwtSecretKey[0]);
        
		// Extract the encrypted data
        const decryptedData = decrypt(decoded.info);

        // Parse the decrypted JSON string into an object
        return JSON.parse(decryptedData);
    } catch (err) {
        logger.error('Token decoding failed:', err);
        throw new Error('Invalid or expired token');
    }
};

exports.verifyToken = (req, res, next) => {
    //first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({ error : 'Token not found'})

    //Extract the jwt token fro the request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(403).json({error: 'Unauthorised'});

    try {
        // verify the JWT token
        const decoded = jwt.verify(token, jwtSecretKey[0]);

        //Attach user information to the request object
        req.user = JSON.parse(decrypt(decoded.info))
        next();
    } catch (error) {
        logger.error('Token decoding failed:', error);
        return res.status(403).json({ error : 'Unauthorised Request'})
    }
}

exports.verifyAdminByToken = (req, res, next) => {
    //first check request headers has authorization or not
    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({ error : 'Token not found'})

    //Extract the jwt token fro the request header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(403).json({error: 'Unauthorised'});

    try {
        // verify the JWT token
        const decoded = jwt.verify(token, jwtSecretKey[0]);

        //Attach user information to the request object
        req.user = JSON.parse(decrypt(decoded.info));
        if(req.user.role != 'iskcon-admin') {
            return res.status(403).json({error: "Access denied: Only admins are allowed to do this action"})
        }
        next();
    } catch (error) {
        logger.error('Token decoding failed:', error);
        return res.status(403).json({ error : 'Unauthorised Request'})
    }
}