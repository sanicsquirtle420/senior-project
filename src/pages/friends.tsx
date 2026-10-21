import { useAuth } from "../utils/AuthContext" ;
import Navbar from "../utils/navbar" ;
import { useState } from "react" ;

const Friends = () => {
    const [ loading, setLoading ] = useState(false) ;
    const [ error, setError ] = useState("") ;
    const [ frienduser, setFrienduser ] = useState("") ;
    const { user } = useAuth() ;

    const friendRequest = async (e) => {
        e.preventDefault() ;
        setError("") ;
        setLoading(true) ;

        try {
            const rawData = localStorage.getItem("session_user") ;
            const id = rawData ? JSON.parse(rawData).id : null ;
            const userID = id != null ? String(id) : null ;

            if (!userID) {
                throw new Error("You need to be logged in to send a friend request.") ;
            }

            const response = await fetch("http://localhost:8000/new_friend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1ID: userID, user2: frienduser }),
            }) ;

            if (!response.ok) {
                const errData = await response.json() ;
                throw new Error(errData.detail || "Failed to add event.") ;
            }
            setFrienduser("") ;
            } catch (err) {
                setError(err.message) ;
            } finally {
                setLoading(false) ;
            }
    } ;

    return (
        <div>
            <h1>PlanPal: Friends</h1>
            <Navbar />
            <h2>{user?.name}'s Friend List</h2>
            <p>Sample accepted friends.</p>

            <h2>Send a Friend Request</h2>
            <form onSubmit={friendRequest}>
            <div className="form-row">
                <label htmlFor="frienduser">Username</label>
                <input 
                    id="frienduser"
                    placeholder="Friend's Username"
                    maxLength={15}
                    type="text"
                    value={frienduser}
                    onChange={(e) => setFrienduser(e.target.value)} 
                    required
                />
            </div>
            <button className="" type="submit" disabled={loading}>
                {loading ? "Sending Request...": "Send Friend Request"}
            </button>
            </form>
            
            <h2>Pending Friend Requests</h2>
            <p>Pending request.</p>
        </div>
    ) ;
} ;

export default Friends ;