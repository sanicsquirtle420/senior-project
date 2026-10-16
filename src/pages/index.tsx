import { Link } from "react-router-dom" ;
import Navbar from "../utils/navbar_index" ;

const Index = () => {
    return(
        <div>
            <center><h1>PlanPal</h1></center>
            <Navbar />
            <h2>Welcome!</h2>
            <p>
                PlanPal is an application that allows users to see their friend's calendar to make
                it easier to plan events with your friends. Users will be able to add their events
                from their dashboard and select their privacy setting for each event. By default,
                your friends will be able to see the times you busy, but unless you change the privacy
                setting they will not be able to see details like the title or description.
            </p>
            <img className="screenshot" src="https://media1.tenor.com/m/eCS_N1ZYbIsAAAAd/the-fragrant-flower-blooms-with-dignity-kaoruko-waguri.gif"
                alt="Karouko Waguri gif"></img>
            <p>
                This senior project is being hosted on <a href="https://www.cloudflare.com/products/pages/">Cloudflare pages</a> (website) 
                , <a href="https://render.com">Render</a> (FastAPI), and <a href="https://layerbase.com">Layerbase</a> (database). <br />
                Go to the <Link to="/dashboard">dashboard</Link>.
            </p>
        </div>
    ) ;
} ;
export default Index ;