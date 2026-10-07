import { useAuth } from "../utils/AuthContext" ;
import { Link } from "react-router-dom" ;
import Navbar from "../utils/navbar" ;

const Dashboard = () => {
    const { user, logout } = useAuth() ;

    return(
        <div>
            <h1>Welcome to PlanPal, {user?.name}</h1>
            <Navbar />
            <h2>Calendar</h2>
            <p>Here is your calendar as of now:</p>

            <h2>Friend's List</h2>
            <p>Sample friends list</p>
        </div>
    ) ;
} ;

export default Dashboard ;