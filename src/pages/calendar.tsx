import { useSearchParams } from "react-router-dom" ;
import { Link } from "react-router-dom" ;
import Navbar from "../utils/navbar" ;

const Calendar = () => {
    const [searchParams] = useSearchParams() ;
    const dateParam = searchParams.get("date") ;

    if(!dateParam) return <p>No date selected.</p>
    const [year, month, day] = dateParam.split("-").map(Number) ;
    const date = new Date(year, month - 1, day) ;
    const formatted = date.toLocaleDateString("en-US" , {
        year: "numeric",
        month: "long",
        day: "numeric",
    }) ;
    return(
        <div>
            <h1>PlanPal: {formatted}</h1>
            <Navbar />
            <h2>Events for {formatted}</h2>
            <p>Sample events!</p>
        </div>
    ) ;
} ;
export default Calendar ;