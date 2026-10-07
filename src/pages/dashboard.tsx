import { useAuth } from "../utils/AuthContext" ;
import { Link, useNavigate } from "react-router-dom" ;
import Calendar from "react-calendar" ;
import Navbar from "../utils/navbar" ;
import "../calendar.css" ;

function toDateString(date) {
    const y = date.getFullYear() ;
    const m = String(date.getMonth() + 1).padStart(2, "0") ;
    const d = String(date.getDate()).padStart(2, "0")
    return String(y) + "-" + String(m) + "-" + String(d) ;
}

const Dashboard = () => {
    const [visibility, setVisibility] = useState("private") ;
    const { user } = useAuth() ;
    const navigate = useNavigate() ;
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
            <p>Fields with * are required.</p>
            <form>
                <div className="form-row">
                <label htmlFor="title">Title*</label>
                <input 
                    id="title"
                    type="text"
                    placeholder="Event Title"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </div>
            <div className="form-row">
                <label htmlFor="desc">Description</label>
                <input 
                    id="desc"
                    type="text"
                    placeholder="Event Description"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)} 
                />
            </div>
            <div className="form-row">
                <label htmlFor="start_time">Start Time*</label>
                <input 
                    id="start_time"
                    type="date"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)} 
                    required
                />
            </div>
            <div className="form-row">
                <label htmlFor="end_time">End Time*</label>
                <input 
                    id="end_time"
                    type="date"
                    // value={email}
                    // onChange={(e) => setEmail(e.target.value)} 
                    required
                />
            </div>
            <div>
                <label htmlFor="visibility">Visibility*</label>
                <select 
                    name="visibility" 
                    id="visibility" 
                    value={visibility} 
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                </select> 
            </div>
            </form>
            <h2>Friend's List</h2>
            <p>Sample friends list</p>
        </div>
    ) ;
} ;

export default Dashboard ;