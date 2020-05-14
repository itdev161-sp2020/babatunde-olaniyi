import express from 'express';
import connectDatabase from './config/db.js';
import { check, validationResult } from 'express-validator';

//Initialize express application
const app = express();

//Connect database
connectDatabase();

// Configuree Middleware 
app.use(express.json({ extended: false }));


//API endpoints
/**
 * @route
 * @desc test end point
 */

app.get('/', (req, res) =>
    res.send('http get request sent to root api endpoint')
);

/**
 * @route
 * @desc test end point
 */

 app.post('/api/users', 
 [
     check('name', 'Please enter your name')
     .not()
     .isEmpty(),
     check('email', 'Please enter a valid email').isEmail(),
     check('password', 
           'Please enter a password with 6 or more characters'
           ).isLength({ min: 6 })
 ],
 (req, res) => {
     const errors = validationResult(req);
     if ( !errors.isEmpty()) {
         return res.status(422).json ({ errors: errrors.array() });
     } else {
     return res.send(req.body)
     }
   }
 );
 


//connection listener
//app.listen(3000, () => console.log('Express server running on port 3000'));
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));