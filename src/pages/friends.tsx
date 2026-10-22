import { useSearchParams } from "react-router-dom" ;
import { useAuth } from "../utils/AuthContext" ;
import Navbar from "../utils/navbar" ;
import { useEffect, useState } from "react" ;

const Friends = () => {
    const [ loading, setLoading ] = useState(false) ;
    const [ error, setError ] = useState("") ;
    const [ friendslist, setFriendslist ] = useState("") ;
    const [ pendinglist, setPendinglist ] = useState("") ;
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

            const response = await fetch("https://api.raccoon2891.com/new_friends", {
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

    useEffect(() => {
        const loadFriends = async () => {
            setLoading(true) ;
            try {
                const rawData = localStorage.getItem("session_user") ;
                const userID = rawData ? JSON.parse(rawData).id : null ;
                if (!userID) throw new Error("You need to be logged in.") ;

                const params = new URLSearchParams({
                    userID: userID,
                }) ;

                const response = await fetch(`https://api.raccoon2891.com/get_friends?${params}`)
                if (!response.ok) throw new Error("Failed to load friends.") ;
                const data = await response.json() ;
                setFriendslist(data) ;
            } catch(err) {
                setError(err.message) ;
            } finally {
                setLoading(false) ;
            }
        } ;
        loadFriends() ;
    }, []) ;
    
    useEffect(() => {
        const loadPending = async () => {
            setLoading(true) ;
            try {
                const rawData = localStorage.getItem("session_user") ;
                const userID = rawData ? JSON.parse(rawData).id : null ;
                if (!userID) throw new Error("You need to be logged in.") ;

                const params = new URLSearchParams({
                    userID: userID,
                }) ;

                const response = await fetch(`https://api.raccoon2891.com/get_pending?${params}`)
                if (!response.ok) throw new Error("Failed to load friends.") ;
                const data = await response.json() ;
                setPendinglist(data) ;
            } catch(err) {
                setError(err.message) ;
            } finally {
                setLoading(false) ;
            }
        } ;
        loadPending() ;
    }, []) ;

    const acceptRequest = async (friendID: number) => {
        setError("") ;
        setLoading(true) ;

        try {
            const rawData = localStorage.getItem("session_user") ;
            const id = rawData ? JSON.parse(rawData).id : null ;

            if (id == null) {
                throw new Error("You need to be logged in to accept a friend request.") ;
            }

            const response = await fetch("https://api.raccoon2891.com/accept_friend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1ID: id, user2ID: friendID, }),
            }) ;

            if (!response.ok) {
                const errData = await response.json() ;
                throw new Error(errData.detail || "Failed to accept friend request.") ;
            }
            } catch (err) {
                setError(err.message) ;
            } finally {
                setLoading(false) ;
        }
    }

    const declineRequest = async (friendID: number) => {
        setError("") ;
        setLoading(true) ;

        try {
            const rawData = localStorage.getItem("session_user") ;
            const id = rawData ? JSON.parse(rawData).id : null ;

            if (id == null) {
                throw new Error("You need to be logged in to decline a friend request.") ;
            }

            const response = await fetch("https://api.raccoon2891.com/decline_friend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user1ID: id, user2ID: friendID, }),
            }) ;

            if (!response.ok) {
                const errData = await response.json() ;
                throw new Error(errData.detail || "Failed to decline friend request.") ;
            }
            } catch (err) {
                setError(err.message) ;
            } finally {
                setLoading(false) ;
        }
    }

    return (
        <div>
            <h1>PlanPal: Friends</h1>
            <Navbar />
            { error && (<p style={{color: "#f38ba8"}}>{error}</p>) }
            <h2>{user?.name}'s Friends List</h2>
            { loading ? (<p>Loading friends...</p>) :  friendslist.length === 0 ? (!error && <p>You have no friends.</p>) :
            ( <table>
                <thead><th>Name</th><th>Username</th></thead>
                <tbody>
                {friendslist.map((fr) => (
                    <tr key={fr.userID}>
                        <td>{fr.name}</td>
                        <td>{fr.username}</td>
                    </tr>
                ))}
                </tbody>
            </table>)
            }

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
            { loading ? (<p>Loading pending requests...</p>) :  pendinglist.length === 0 ? (!error && <p>You have no pending friend requests.</p>) :
            ( <table>
                <thead><th>Name</th><th>Username</th><th></th><th></th></thead>
                <tbody>
                {pendinglist.map((pe) => (
                    <tr key={pe.userID}>
                        <td>{pe.name}</td>
                        <td>{pe.username}</td>
                        <td><button onClick={() => acceptRequest(pe.userID)}>Accept</button></td>
                        <td><button onClick={() => declineRequest(pe.userID)}>Decline</button></td>
                    </tr>
                ))}
                </tbody>
            </table>)
            }
        </div>
    ) ;
} ;

export default Friends ;