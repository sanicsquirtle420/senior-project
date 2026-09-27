import { Link } from "react-router-dom" ;

const Index = () => {
    return(
        <div>
            <h1>PlanPal</h1>
            <p>Welcome to the index page for PlanPal!</p>
            <img className="screenshot" src="https://media1.tenor.com/m/eCS_N1ZYbIsAAAAd/the-fragrant-flower-blooms-with-dignity-kaoruko-waguri.gif"
                alt="Karouko Waguri gif"></img>
            <p>Click here to <Link to="/login">login</Link>.</p>
        </div>
    ) ;
} ;
export default Index ;