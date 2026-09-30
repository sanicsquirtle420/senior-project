import { Link, useNavigate } from "react-router-dom" ;
import { useAuth } from "../utils/AuthContext" ;
import { LoginResponse } from "../utils/types";
import { useState } from "react" ;

const Login = () => {
    const [email, setEmail] = useState("") ;
    const [password, setPassword] = useState("") ;
    const [error, setError] = useState("") ;
    const [loading, setLoading] = useState(false) ;

    const { login } = useAuth() ;
    const navigate = useNavigate() ;

    const handleLogin = async (e) => {
        e.preventDefault() ;
        setError("") ;
        setLoading(true) ;

        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            }) ;

            if(!response.ok) {
                const errData = await response.json() ;
                throw new Error(errData.detail || "Login failed") ;
            }
             
            const data = (await response.json()) as LoginResponse ;
            const { token, ...user} = data ;

            login(user, data) ;
            navigate("/dashboard") ;
        } catch (err) {
            setError(err.message) ;
        } finally {
            setLoading(false) ;
        }
    } ;

    return (
        <form onSubmit={handleLogin}>
            <h1>Login</h1>
            {error && <p style={{color: "#f38ba8"}}>{error}</p>}

            <div className="form-row">
                <label htmlFor="email">Email</label>
                <input 
                    id="email"
                    type="email"
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Logging in...": "Login"}
            </button>

            <p>Don't have an account? <Link to="/signup">Sign Up</Link> | Return to <Link to="/">home</Link>.</p>
        </form>
    ) ;
} ;

export default Login ;