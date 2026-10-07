import { useSearchParams } from "react-router-dom" ;
import { useState, useEffect } from "react" ;
import Navbar from "../utils/navbar" ;

function toDB(date) {
    return date.toISOString().slice(0, 19).replace("T", " ") ;
}

const Calendar = () => {
    const [searchParams] = useSearchParams() ;
    const dateParam = searchParams.get("date") ;
    const [events, setEvents] = useState([]) ;
    const [error, setError] = useState("") ;

    useEffect(() => {
        if (!dateParam) return ;

        const loadEvents = async () => {
            try {
                const rawData = localStorage.getItem("session_user") ;
                const userID = rawData ? JSON.parse(rawData).id : null ;
                if (!userID) throw new Error("You need to be logged in.") ;

                // local midnight to next local midnight, converted to UTC
                const [year, month, day] = dateParam.split("-").map(Number) ;
                const dayStart = new Date(year, month - 1, day) ;
                const dayEnd = new Date(year, month - 1, day + 1) ;

                const params = new URLSearchParams({
                    user_id: userID,
                    start: toDB(dayStart),
                    end: toDB(dayEnd),
                }) ;

                const response = await fetch(`http://localhost:8000/get_events?${params}`) ;
                if (!response.ok) throw new Error("Failed to load events.") ;

                const data = await response.json() ;
                setEvents(data) ;
            } catch (err) {
                setError(err.message) ;
            }
        } ;

        loadEvents() ;
    }, [dateParam]) ;

    if (!dateParam) return <p>No date selected.</p> ;

    const [year, month, day] = dateParam.split("-").map(Number) ;
    const date = new Date(year, month - 1, day) ;
    const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }) ;

    return (
        <div>
            <h1>PlanPal: {formatted}</h1>
            <Navbar />
            <h2>Events for {formatted}</h2>
            {error && <p style={{ color: "#f38ba8" }}>{error}</p>}
            {events.length === 0 ? (!error && <p>No events for this day.</p>) :
            ( <table>
                <tr><td>Event Name</td><td>Description</td><td>Start Time</td><td>End Time</td><td>Visibility</td></tr>
                {events.map((ev) => (
                    <tr key={ev.event_id}>
                        <td>{ev.title}</td>
                        <td>{ev.description}</td> 
                        <td>{new Date(ev.start_time).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}</td>
                        <td>{new Date(ev.end_time).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}</td>
                        <td>{ev.visibility}</td>
                    </tr>
                ))}
            </table> )}
        </div>
    ) ;
} ;

export default Calendar ;