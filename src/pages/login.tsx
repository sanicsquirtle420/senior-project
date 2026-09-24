import { Link } from "react-router-dom" ;
import React, { useState } from "react" ;

function Login() {
    const [email, setEmail] = useState("") ;
    const [password, setPassword] = useState("") ;
    const [message, setMessage] = useState("") ;
    const handleLogin =(e)=> {
        e.preventDefault() ;

        if(email === "druiz@sanicsquirtle.com" && password === "1234") {
            setMessage("Success!") ;
        } else {
            setMessage("Invalid.") ;
        }
    } ;

    return(
        <>
        
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
        <input type="email" placeholder="user@example.com" value={email} 
            onChange={(e) => setEmail(e.target.value)} required/>
        <input type="password" placeholder="Password" value={password} 
            onChange={(e) => setPassword(e.target.value)} required></input>
        <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
        <img className="screenshot" src="https://media1.tenor.com/m/M5IQwflJz0UAAAAd/juno-overwatch.gif" alt="Juno Overwatch waving gif"/>
        <p>Return to <Link to="/">home</Link>.</p>
        </>
    ) ;
}

export default Login ;