import React, {useState} from 'react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';

//destructured parameter of authProps passed by App.tsx
//This is where we receive the function we call on the bottom
const Register = ({ authenticateUser }) =>{
    let history = useHistory();
    //destructuring assignment, unpack array into first element within []
    const[userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm:''
    });

    const [errorData, setErrorData]= useState({errors: null});
    const {name,email,password,passwordConfirm} = userData;
    const {errors} = errorData;

    //fat arrow function with e parameter
    const onChange = (e) =>{
        const {name,value} = e.target;
        setUserData({
            ...userData,
            [name]:value
        })
    }

    //if password confirmation passes, set newUser fields to 
    //match our fields at this point.
    const registerUser = async () => {
        if(password !== passwordConfirm){
            console.log('Passwords do not match');
        }
        else{
            const newUser = {
                name:name,
                email:email,
                password:password
            }
            //try to add new user to database, otherwise log error
            try{
                const config ={
                 headers: {
                'Content-Type' : 'application/json'
                    }
                }

                const body = JSON.stringify(newUser);
                const res = await axios.post('https://localhost:5000/api/users', body, config);
               
                //store user data and redirect
                localStorage.setItem('token', res.data.token);
                history.push('/');

            } catch(error){
                localStorage.removeItem('token');

                setErrorData({
                    ...errors,
                    errors: error.response.data.errors
                })
             }
             authenticateUser();
        }
    }

    return(
        <div>
            <h2>Register</h2>
            <div>
                <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={name}
                    onChange={e=>onChange(e)}
                />
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={e=>onChange(e)}
                />
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={e=>onChange(e)}
                />
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Confirm Password"
                    name="passwordConfirm"
                    value={passwordConfirm}
                    onChange={e=>onChange(e)}
                />
            </div>
            <div>
                <button onClick={() => registerUser()}>Register</button>
            </div>
            <div>
                {errors && errors.map(error =>
                    <div key={error.msg}>{error.msg}</div>)}
            </div>
        </div>
    )
}

export default Register

