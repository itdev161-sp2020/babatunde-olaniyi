import jwt from  'jsonwebtoken';
//secret and mongoURI
import config from 'config';

const auth = (req,res,next) =>{
    const token = req.header('x-auth-token');
    const secret = config.get('jwtSecret');

    if(!token){
        return res
            .status(401)
            .json({messages: 'Missing authentication token. Authorization failed.'});
    }

    try{
        const decodedToken = jwt.verify(token,secret);
        req.user = decodedToken.user;

        next();
    }catch(error){
        res
            .status(401)
            .json({message: 'Invalid authentication token. Authorization failed.'});
    }
};

//only one default export per file, allows simple import statement
export default auth;