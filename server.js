import express from 'express';
import connectDatabase from './config/db';
import { check, validationResult } from 'express-validator';//importing check and validationResult which are named exports (hence the curly braces)                                                                                  
import cors from 'cors';   //allow CORS
import bcrypt from 'bcryptjs'; //used to encrypt password
import jwt from 'jsonwebtoken';  //import json web token
import config from 'config'; //import config...
import auth from './middleware/auth';
import User from './models/User'; //our model to create users
import Post from './models/Post'; //our model to create users

//Initialize express application
const app = express(); 

//connection database
connectDatabase();

// Configure Middleware
app.use(express.json({ extended: false }));
app.use(
    cors({
        origin: 'http://localhost:3000'
    })
);


//API endpoint
/**
 * @route GET/
 * @desc Test endpoint
 */
app.get('/', (req, res) =>
    res.send('http get request sent to root api endpoint')
);
app.get('/api/', (req, res) => res.send('http get request sent to api'));

app.post(
    '/api/users',
    [
        check('name', 'Please enter your name').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({min:6})
    ],
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array()});
        }else{
            const { name, email, password } = req.body;
            try{

                //check if user exists
                let user = await User.findOne({ email: email });
                if(user){
                    return res
                    .status(400)
                    .json({errors: [{msg:'User already exists'}]});
                }

                //create a new user
                user = new User({
                    name:name,
                    email:email,
                    password:password
                });

                // encrypt the password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password,salt);

                //save to db and return
                await user.save();

                //generate and return a jwt token
                returnToken(user,res);
            }catch(error){
                res.status(500).send('Server error');
            }
        }
    }
);

/**
 * @route POST api/users
 * @desc Register user
 */

 app.post( 

     '/api/users', 
    
 [
    check('name', 'Please enter your name')
    .not()
    .isEmpty(),
     check('email', 'Please enter a valid email')
    .isEmail(),
     check( 'password', 'Please enter a password with 6 or more characters')
    .isLength({min : 6})
 ],
     //function with request and response objects
     //errors caught from imported express-validator and above code
      async(req, res)=>{ 
          const errors=validationResult(req) 
             if(!errors.isEmpty())
             {
               return res.status(422).json({errors: errors.array()});
             } else{
         //deconstruct request body into 3 constants   
         const{name, email, password} = req.body;                                             
     try{

        // check if user exists
         let user = await User.findOne({email: email});
         if(!user){
             return res
                .status(400)
                 .json({errors: [{ msg:'User already exists'}] });
         }

         // Create new user if no match was found
         user= new User({
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
             returnToken = (user, res);
    } catch (error) {
        res.status(500).send('Server error');
    }
}
      }
 );
 /**
 * @route Get api/auth
 * @desc Authenticate user
 */
app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Unknown server error');
    }
});

/**
 * @route POST api/login
 * @desc Login user
 */

app.post(
    '/api/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password','A password is required').exists()
    ],
    async (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({error:errors.array()});
        }else{
            const {email,password }=req.body;
            try{
                //check if user exists
                let user = await User.findOne({email:email});
                if(!user){
                    return res
                    .status(400)
                    .json({errors:[{msg:'Invalid email or password'}]});
                }

                //check password
                const match =await bcrypt.compare(password,user.password);
                if(!match){
                    return res
                    .status(400)
                    .json({errors:[{msg:'Invalid email or password'}]});
                }
                //generate and return a jwt token
                returnToken(user,res);
            }catch(error){
                res.status(500).send('Server error');
            }
        } 
    }
);



const returnToken = (user,res) => {
    const payload = {
        user:{
            id:user.id 
        }
    };

    jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn:'10hr'},
        (err,token)=>{
            if(err)throw err;
            res.json({token:token});
        }
    );
};
 

// Post endpoints
/**
 * @route POST api/posts
 * @desc Create post
 */

app.post(
    '/api/posts',
    [
      auth,
      [
        check('title', 'Title text is required')
          .not()
          .isEmpty(),
        check('body', 'Body text is required')
          .not()
          .isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      } else {
        const { title, body } = req.body;
        try {
          // Get the user who created the post
          const user = await User.findById(req.user.id);
  
          // Create a new post
          const post = new Post({
            user: user.id,
            title: title,
            body: body
          });
  
          // Save to the db and return
          await post.save();
  
          res.json(post);
        } catch (error) {
          console.error(error);
          res.status(500).send('Server error');
        }
      }
    }
  );

  /**
 * @route GET api/posts
 * @desc Get posts
 */

app.get(
    '/api/posts',
    auth,
    async (req, res) => {
        try {
            const posts = await Post.find().sort({ date: -1 });

            res.json(posts);
        } catch (error) {
            console.error.apply(error);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route GET api/posts/:id
 * @desc Get post
 */

app.get(
    '/api/posts/:id',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);

            //Make sure the post was found
            if (!post) {
                return res.status(404).json({ msg: 'Post not found'});
            }

            res.json(post);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route DELETE api/posts/:id
 * @desc Delete a post
 */
app.delete(
    '/api/posts/:id',
    auth,
    async (req, res) => {
        try{
            const post = await Post.findById(req.params.id);

            //Make sure the post was found
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            //make sure the request user created the post
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'User not authorized'});
            }

            await post.remove();

            res.json({ msg: 'Post removed'});
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);

/**
 * @route PUT api/posts/:id
 * @desc Update a post
 */
app.put(
    '/api/posts/:id',
    auth,
    async (req, res) => {
        try{
            const { title, body } = req.body;
            const post = await Post.findById(req.params.id);
            
            //Make sure post was found
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
            }

            //Make sure the request user created the post
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'USer not authorized' });
            }

            //Update the post and return
            post.title = title || post.title;
            post.body = body || post.body;

            await post.save();

            res.json(post);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
);
    /*
    //connection listener
    //app.listen(3000, () => console.log('Express server running on port 3000'));
    */

const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));
