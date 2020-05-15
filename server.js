import express from 'express';
import connectDatabase from './config/db';
import {check, validationResult } from 'express-validator';//importing check and validationResult which are named exports (hence the curly braces)                                                      //no braces will import whatever the default export
import cors from 'cors';   //allow CORS
import bcrypt from 'bcryptjs'; //used to encrypt password
import User from './models/User'; //our model to create users
import jwt from 'jsonwebtoken';  //import json web token
import config from 'config'; //import config...
import auth from './middleware/auth';

//Initialize express application
const app = express(); 

//Connect database
connectDatabase();

// Configure Middleware (express is the web server framework and cors allows for CORS)
app.use(express.json({ extended: false }));
app.use(
    cors({
        origin: 'http://localhost:3000'
    })
)


//API endpoints

/**
 * @route
 * @desc test end point
 */

app.get('/', (req, res) =>
    res.send('http get request sent to root api endpoint')
);

 //AUTHORIZE
 //verify token and authenticate user 
 app.get('/api/auth',auth,async(req,res) => {
    try{
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    }catch(error){
        res.status(500).send('Unkown server error');
    }
})
 
 app.post(  //When a post is made to our 'api/users' page log the request body and respond with it.
      //destination
     '/api/users', 
     //functions which create an error object if false.
 [
     check('name', 'Please enter your name')
     .not()
     .isEmpty(),
     check('email', 'Please enter a valid email').isEmail(),
     check('password', 
           'Please enter a password with 6 or more characters'
           ).isLength({ min: 6 })
 ],
     
 async(req, res)=>{  //function with request and response objects
                    //errors caught from imported express-validator and above code
    const errors=validationResult(req) //if there is an error return error object array (msg, param, location) are properties of errors
    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array()});
    }
    else{
    
        const{name, email, password} = req.body; //deconstruct request body into 3 constants
                                                 //const {propName, anotherPropName} = object with ma
     try{
         let user = await User.findOne({email: email});
         if(user){
             return res
             .status(400)
             .json({errors: [{ msg:'User already exists'}]});
         }
        
         user= new User({ // Create new user if no match was found
            name: name,
            email: email,
            password: password
        });

        // Encrpt the password
        const salt = await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);

       // Save to the db and return 
        await user.save();
        
        // Generate and rerturn a JWT token 
        const payload = { 
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: '10hr' },
            (err, token) => {
                  if (err) throw err; 
                      res.json({ token:token });
                  }
        );
                } catch (error) {
            res.status(500).send("Server error");
        }
       }
   }  
   );

    //connection listener
    //app.listen(3000, () => console.log('Express server running on port 3000'));
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));
