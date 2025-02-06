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
    console.log('Crypto Error:::', err);
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


// const decrypt = (data) => {
//     let decrypted;
//     let ivDecryptLength = 2 * ivLength; //iv string is concatenation of iv buffered bytes
//     let iv = Buffer.from(data.slice(0, ivDecryptLength), 'hex');
//     let encryptedText = Buffer.from(data.slice(ivDecryptLength), 'hex');
//         for(let i=0;i<cryptoKey.length;i++){
//             try{
//                 let decipher = crypto.createDecipheriv(cryptoAlgo, Buffer.from(cryptoKey[i]), iv); // create decipher from cryptoKey value. 
//                 decrypted = decipher.update(encryptedText);
//                 decrypted = Buffer.concat([decrypted, decipher.final()]);
//                 break;

//             }catch(err){
//                     logger.error('Unable to decrypt from cryptoKey',i);
//                     logger.error(err);

//             }
//         }
//     return decrypted.toString();
// }
// exports.getDecodedValue = function(token){
// 	let decoded='', decodedJWT='';
// 	console.log("got token in function",token)
	
// 	try {
// 		for(let i =0;i<jwtSecretKey.length;i++) {
// 			try {
				
// 				decodedJWT = jwt.verify(token, jwtSecretKey[i]);
// 				let decipher = decrypt(decodedJWT.info);
// 				console.log(decipher)
// 				decoded = JSON.parse(decipher);
// 				console.log("mila",decoded)
// 				if(i != 0) {
// 					let res = exports.getEncodedCookie(decoded); // generate new token for old token.
// 					decoded['dm_token'] = res;
// 					return decoded;
// 				}
// 				break;
// 			}
// 			catch(err) {
// 				if(err.name === 'JsonWebTokenError' && i < jwtSecretKey.length - 1) {
// 					logger.error("Invalid Signature for " , i);
// 				}
// 				else {
// 					logger.error(err);
// 				}
// 			}
// 		}
// 	} catch (error) {
// 		decoded = getDecodedValueV1(token);
// 	}
// 	return decoded;
// };

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


