import React from "react";

function Login(props)
{
    const {updateusername, updatepassword, checkLoginCredentials} = props;
    return (
        <div>
            <input onChange={(e)=>{updateusername(e.target.value)}} type="text" placeholder="Username"></input>
            <input onChange={(e)=>{updatepassword(e.target.value)}} type="password" placeholder="Password"></input>

            <button onClick={checkLoginCredentials}>Login</button>
        </div>
    )
}

export default Login;
