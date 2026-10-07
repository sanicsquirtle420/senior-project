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
                    <li><Link to="/" onClick={() => setIsOpen(!isOpen)}>Home</Link></li>
                    <li><Link to="/calendar" onClick={() => setIsOpen(!isOpen)}>Calendar</Link></li>
                    <li><Link to="/friends" onClick={() => setIsOpen(!isOpen)}>Friends</Link></li>
                    <li><Link to="/" onClick={logout}>Sign Out</Link></li>
                </ul>
            </div>
        </nav>
    ) ;
}

export default Navbar ;