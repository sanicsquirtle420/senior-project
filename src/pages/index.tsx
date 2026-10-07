import { Link } from "react-router-dom" ;
import Navbar from "../utils/navbar_index" ;

const Index = () => {
    return(
        <div>
            <h1>PlanPal</h1>
            <Navbar />
            <p>Welcome to the index page for PlanPal! Go to the <Link to="/dashboard">dashboard</Link>.</p>
            <img className="screenshot" src="https://media1.tenor.com/m/eCS_N1ZYbIsAAAAd/the-fragrant-flower-blooms-with-dignity-kaoruko-waguri.gif"
                alt="Karouko Waguri gif"></img>
        </div>
    ) ;
} ;
export default Index ;