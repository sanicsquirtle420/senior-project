import { useAuth } from "../utils/AuthContext" ;
import { Link } from "react-router-dom" ;

const Dashboard = () => {
    const { user, logout } = useAuth() ;

    return(
        <div>
            <h1>Welcome to PlanPal, {user?.name}</h1>
            <p>Random garbage! I will just pretend I can see stuff here :D</p>
            <img className="screenshot" src="https://media1.tenor.com/m/pOx6iHggcrgAAAAC/yots-no.gif"
                alt="Yotsuba Nakano gif"></img>
            <br />
            <p>Click the button to sign out.</p>
            <button onClick={logout}>Sign Out</button>
        </div>
    ) ;
} ;

export default Dashboard ;