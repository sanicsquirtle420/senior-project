import {Link} from "react-router-dom" ;
import {useState} from "react" ;
import { useAuth } from "../utils/AuthContext" ;
import "./navbar.css" ;

function Navbar() {
    function todayString() {
        const today = new Date() ;
        const y = today.getFullYear() ;
        const m = String(today.getMonth() + 1).padStart(2, "0") ;
        const d = String(today.getDate()).padStart(2, "0")
        return String(y) + "-" + String(m) + "-" + String(d) ;
    }

    const [isOpen, setIsOpen] = useState(false) ;
    const { logout }  = useAuth() ;
    return (
        <nav className="navigation">
            <div className="nav-container">
                <ul className={`nav-links ${isOpen ? "active" : ""}`}>
                    <li><p>Navigation:</p></li>
                    <li><Link to="/dashboard" onClick={() => setIsOpen(!isOpen)}>Dashboard</Link></li>
                    <li><Link to={"/calendar?date=" + todayString()} onClick={() => setIsOpen(!isOpen)}>Calendar</Link></li>
                    <li><Link to="/friends" onClick={() => setIsOpen(!isOpen)}>Friends</Link></li>
                    <li><Link to="/" onClick={logout}>Sign Out</Link></li>
                </ul>
            </div>
        </nav>
    ) ;
}

export default Navbar ;