import { Link } from "react-router-dom" ;

function Index() {
    return(
        <>
        <h1>PlanPal</h1>
        <p>Click here to <Link to="/login">login</Link>.</p>
        <p>Hello welcome to the index page!</p>
        <img className="screenshot" src="https://media1.tenor.com/m/M5IQwflJz0UAAAAd/juno-overwatch.gif" alt="Juno Overwatch waving gif"/>
        </>
    ) ;
}

export default Index ;