import { Link, useNavigate } from "react-router-dom" ;
import { useAuth } from "../utils/AuthContext" ;
import Calendar from "react-calendar" ;
import Navbar from "../utils/navbar" ;
import { useState } from "react" ;
import "../calendar.css" ;

function toDateString(date) {
    const y = date.getFullYear() ;
    const m = String(date.getMonth() + 1).padStart(2, "0") ;
    const d = String(date.getDate()).padStart(2, "0")
    return String(y) + "-" + String(m) + "-" + String(d) ;
}

function toDB(iso) {
    return new Date(iso).toISOString().slice(0, 19).replace("T", " ") ;
}

const Dashboard = () => {
    const [ title, setTitle ] = useState("") ;
    const [ desc, setDesc ] = useState("") ;
    const [ start_time, setStartTime ] = useState("") ;
    const [ end_time, setEndTime ] = useState("") ;
    const [ visibility, setVisibility ] = useState("private") ;
    const [ error, setError ] = useState("") ;
    const [ loading, setLoading ] = useState(false) ;
    const { user } = useAuth() ;
    const navigate = useNavigate() ;

    const newEvent = async (e) => {
    e.preventDefault() ;
    setError("") ;
    setLoading(true) ;

    try {
        const rawData = localStorage.getItem("session_user") ;
        const userID = rawData ? JSON.parse(rawData).id : null ;

        if (!userID) {
            throw new Error("You need to be logged in to add an event.") ;
        }

        const startUTC = toDB(start_time) ;
        const endUTC = toDB(end_time) ;

        const response = await fetch("http://localhost:8000/new_event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userID, title, desc, start_time: startUTC, end_time: endUTC, visibility }),
        }) ;

        if (!response.ok) {
            const errData = await response.json() ;
            throw new Error(errData.detail || "Failed to add event.") ;
        }

        setTitle("") ;
        setDesc("") ;
        setStartTime("") ;
        setEndTime("") ;
        setVisibility("private") ;
    } catch (err) {
        setError(err.message) ;
    } finally {
        setLoading(false) ;
    }
} ;

    return(
        <div>
            <h1>Welcome to PlanPal, {user?.name}</h1>
            <Navbar />
            <h2>Calendar</h2>
            <p>Here is your calendar as of now:</p>
            <Calendar 
                className="my-calendar"
                calendarType="gregory"
                locale="en-US"
                onClickDay={(date) => navigate("/calendar?date=" + toDateString(date))}/>

            <h3>Add an Event</h3>
            {error && <p style={{color: "#f38ba8"}}>{error}</p>}
            <p>Fields with * are required.</p>
            <form onSubmit={newEvent}>
                <div className="form-row">
                <label htmlFor="title">Title*</label>
                <input 
                    id="title"
                    type="text"
                    maxLength={150}
                    placeholder="Event Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                />
            </div>
            <div className="form-row">
                <label htmlFor="desc">Description</label>
                <input 
                    id="desc"
                    type="text"
                    placeholder="Event Description"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)} 
                />
            </div>
            <div className="form-row">
                <label htmlFor="start_time">Start Time*</label>
                <input 
                    id="start_time"
                    type="datetime-local"
                    value={start_time}
                    onChange={(e) => setStartTime(e.target.value)} 
                    required
                />
            </div>
            <div className="form-row">
                <label htmlFor="end_time">End Time*</label>
                <input 
                    id="end_time"
                    type="datetime-local"
                    value={end_time}
                    onChange={(e) => setEndTime(e.target.value)} 
                    required
                />
            </div>
            <div className="form-row">
                <label htmlFor="visibility">Visibility*</label>
                <select 
                    name="visibility" 
                    id="visibility" 
                    value={visibility} 
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public</option>
                </select> 
            </div>
            <button className="" type="submit" disabled={loading}>
                {loading ? "Adding Event...": "Add Event"}
            </button>
            </form>
            <h2>Friend's List</h2>
            <p>Sample friends list</p>
        </div>
    ) ;
} ;

export default Dashboard ;