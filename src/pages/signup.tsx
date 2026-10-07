import { Link, useNavigate } from "react-router-dom" ;
import { useAuth } from "../utils/AuthContext" ;
import { SignupResponse } from "../utils/types";
import { useState } from "react" ;

const Signup = () => {
    const [name, setName] = useState("") ;
    const [username, setUsername] = useState("") ;
    const [email, setEmail] = useState("") ;
    const [password, setPassword] = useState("") ;
    const [error, setError] = useState("") ;
    const [loading, setLoading] = useState(false) ;

    const navigate = useNavigate() ;

    const handleSignup = async (e) => {
        e.preventDefault() ;
        setError("") ;
        setLoading(true) ;

        try {
            const response = await fetch("http://localhost:8000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            }) ;

            if(!response.ok) {
                const errData = await response.json() ;
                throw new Error(errData.detail || "Sign up failed") ;
            }
             
            navigate("/login") ;
        } catch (err) {
            setError(err.message) ;
        } finally {
            setLoading(false) ;
        }
    } ;

    return (
        <form onSubmit={handleSignup}>
            <h1>Signup</h1>
            {error && <p style={{color: "#f38ba8"}}>{error}</p>}

            <div className="form-row">
                <label htmlFor="name">Name</label>
                <input 
                    id="name"
                    type="text"
                    maxLength={15}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                />
            </div>
            <div className="form-row">
                <label htmlFor="username">Username</label>
                <input 
                    id="username"
                    type="text"
                    maxLength={15}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                />
            </div>
            <div className="form-row">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
                    maxLength={35}
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </div>
            <div className="form-row">
                <label htmlFor="password">Password</label>
                <input 
                    id="password"
                    type="password"
                    maxLength={24}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Creating account...": "Create Account"}
            </button>

            <p>Already have an account? <Link to="/login">Login</Link> | Return to <Link to="/">home</Link>.</p>
        </form>
    ) ;
} ;

export default Signup ;