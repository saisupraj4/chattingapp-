import React from "react";

function Register(props)
{
    const {updateusername, updatepassword, newRegistration} = props;
    return (
        <div>
            <input onChange={(e)=>{updateusername(e.target.value)}} placeholder="username"></input>
            <input onChange={(e)=>{updatepassword(e.target.value)}} placeholder="password"></input>

            <button onClick={newRegistration}>Register</button>
        </div>
    )
}

export default Register;