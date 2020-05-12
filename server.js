import express from 'express';
import connectDatabase from './config/db.js';

//Initialize express application
const app = express();

//Connect database
connectDatabase();

// Configuree Middleware 
app.use(express.json ({ extended: false }));


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

 app.post('/api/users', (req, res) => {
     console.log(req.body);
     res.send(req.body);
 });
 
//connection listener
app.listen(3000, () => console.log('Express server running on port 3000'));