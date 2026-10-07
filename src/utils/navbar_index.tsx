import {Link} from "react-router-dom" ;
import {useState} from "react" ;
import { useAuth } from "../utils/AuthContext" ;
import "./navbar.css" ;

function Navbar() {
    const [isOpen, setIsOpen] = useState(false) ;
    const { logout }  = useAuth() ;
    return (
        <nav className="navigation">
            <div className="nav-container">
                <ul className={`nav-links ${isOpen ? "active" : ""}`}>
                    <li><p>Navigation:</p></li>
                    <li><Link to="/login" onClick={() => setIsOpen(!isOpen)}>Login</Link></li>
                    <li><Link to="/signup" onClick={() => setIsOpen(!isOpen)}>Sign Up</Link></li>
                </ul>
            </div>
        </nav>
    ) ;
}

export default Navbar ;