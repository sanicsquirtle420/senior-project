import { useSearchParams, Link } from "react-router-dom" ;
import { Button, Table, Collapse } from "react-bootstrap" ;
import EditEventForm from "../utils/event_dropdown" ;
import { useState, useEffect, Fragment, useMemo } from "react" ;
import Navbar from "../utils/navbar" ;
import { Friend } from "../utils/types" ;
import { authFetch } from "../utils/api" ;
import { useAuth } from "../utils/AuthContext" ;

function toDB(date: Date | string): string {
    const dateObj = date instanceof Date ? date: new Date(date)
    return dateObj.toISOString().slice(0, 19).replace("T", " ") ;
}

function yesterday(dateParam: string): string {
    const [ye, mo, da] = dateParam.split("-").map(Number) ;
    const date = new Date(ye, mo - 1, da) ;
    date.setDate(date.getDate() - 1) ;
    const y = date.getFullYear() ;
    const m = String(date.getMonth() + 1).padStart(2, "0") ;
    const d = String(date.getDate()).padStart(2, "0") ;
    return String(y) + "-" + String(m) + "-" + String(d) ;
}

function tomorrow(dateParam: string): string {
    const [ye, mo, da] = dateParam.split("-").map(Number) ;
    const date = new Date(ye, mo - 1, da) ;
    date.setDate(date.getDate() + 1) ;
    const y = date.getFullYear() ;
    const m = String(date.getMonth() + 1).padStart(2, "0") ;
    const d = String(date.getDate()).padStart(2, "0") ;
    return String(y) + "-" + String(m) + "-" + String(d) ;
}

const Calendar = () => {
    const { user, token } = useAuth() ;
    const [searchParams] = useSearchParams() ;
    const dateParam = searchParams.get("date") ;
    const [events, setEvents] = useState([]) ;
    const [error, setError] = useState("") ;
    const [ friendEvents, setFriendEvents ] = useState("") ;
    const [ friendsList, setFriendslist ] = useState<Friend[]>([])
    const [ expandedEventID, setExpandedEventID ] = useState<number | null>(null) ;
    const [ sharedFriendshipIDs, setSharedFriendshipIDs ] = useState<number[]>([]) ;
    const selectedEvent = events.find((e) => e.eventID === expandedEventID) ?? null ;

    useEffect(() => {
        if (!dateParam) return ;

        const loadEvents = async () => {
            try {
                const rawData = localStorage.getItem("session_user") ;
                const userID = rawData ? JSON.parse(rawData).id : null ;
                if (!userID) throw new Error("You need to be logged in.") ;

                const [year, month, day] = dateParam.split("-").map(Number) ;
                const dayStart = new Date(year, month - 1, day) ;
                const dayEnd = new Date(year, month - 1, day + 1) ;

                const params = new URLSearchParams({ 
                    start: toDB(dayStart),
                    end: toDB(dayEnd),
                }) ;

                const response = await authFetch(`/get_events?${params}`, token) ;
                
                if (!response.ok) throw new Error("Failed to load events.") ;

                const data = await response.json() ;
                setEvents(data) ;
            } catch (err) {
                setError(err.message) ;
            }
        } ;

        loadEvents() ;
    }, [dateParam]) ;

    
useEffect(() => {
    if (!dateParam) return;

    const getFriendEvents = async () => {
        try {
            const rawData = localStorage.getItem("session_user");
            const userID = rawData ? JSON.parse(rawData).id : null;

            if (!userID) {
                throw new Error("You need to be logged in.");
            }

            const [year, month, day] = dateParam.split("-").map(Number);
            const dayStart = new Date(year, month - 1, day);
            const dayEnd = new Date(year, month - 1, day + 1);

            const frResponse = await authFetch(
                `/get_friends?`
            , token);

            if (!frResponse.ok) {
                throw new Error("Failed to load friends.");
            }

            const fResponse = await frResponse.json();
            const friendIDs = fResponse.map(
                (friend: { userID: number }) => friend.userID
            );

            const friends: Friend[] = fResponse.map(
                (friend: Friend) => ({
                    userID: Number(friend.userID),
                    name: friend.name,
                    username: friend.username,
                    friendshipID: Number(friend.friendshipID)
                })
            ) ;

            setFriendslist(friends) ;

            const allFriendEvents = (
                await Promise.all(
                    friendIDs.map(async (friendID: number) => {
                        const params = new URLSearchParams({
                            userID: String(user.id),
                            friendID: String(friendID),
                            start: toDB(dayStart),
                            end: toDB(dayEnd)
                        });

                        const response = await authFetch(
                            `/friend_events?${params}`
                        , token);

                        if (!response.ok) {
                            throw new Error(
                                `Failed to load events for friend ${friendID}.`
                            );
                        }

                        const events = await response.json();

                        return events.map((event: object) => ({
                            ...event,
                            friendID
                        }));
                    })
                )
            ).flat();

            setFriendEvents(allFriendEvents) ;
        } catch (error) {
            console.error("Error loading friend events:", error);
        }
    };

    getFriendEvents();
}, [dateParam]);

const loadShares = async (eventID: number) => {
    const params = new URLSearchParams({ eventID: String(eventID) }) ;
    const response = await authFetch(`/get_event_shares?${params}`, token) ;

    if (!response.ok) throw new Error("Failed to load shared friends.");

    const rows = await response.json() ;
    setSharedFriendshipIDs(
        rows.map((row: number | number[] | { friendshipID: number }) => {
            if (Array.isArray(row)) return Number(row[0]) ;
            if (typeof row === "object") return Number(row.friendshipID) ;
            return Number(row) ;
        })) ;

} ;

   useEffect(() => {
       setSharedFriendshipIDs([]);

       if (!selectedEvent || selectedEvent.visibility !== "private") return;

       loadShares(selectedEvent.eventID).catch((err) => setError(err.message));
   }, [selectedEvent?.eventID, selectedEvent?.visibility]);

const sharePrivate = async (
    eventID: number,
    changes: { add: number[]; remove: number[] }
) => {
    const response = await authFetch("/share_private", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventID, addIDs: changes.add, removeIDs: changes.remove }),
    });

    if (!response.ok) throw new Error("Failed to share event.");

    await loadShares(eventID); 
}

    if (!dateParam) return <p>No date selected.</p> ;

    const [year, month, day] = dateParam.split("-").map(Number) ;
    const date = new Date(year, month - 1, day) ;
    const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }) ;

const updateEvent = async (updatedEvent: {
    eventID: number ;
    title: string ;
    description: string ;
    start_time: string ;
    end_time: string ;
    visibility: string ;
}) => {
    setError("") ;
    
    try {
        const rawData = localStorage.getItem("session_user") ;
        const id = rawData ? JSON.parse(rawData).id : null ;

        if (!id) {
            throw new Error("You need to be logged in to add an event.") ;
        }

        const startUTC = toDB(updatedEvent.start_time) ;
        const endUTC = toDB(updatedEvent.end_time) ;

        const response = await authFetch("/update_event", token, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                eventID: updatedEvent.eventID, 
                title:updatedEvent.title, 
                description: updatedEvent.description, 
                start_time: startUTC, 
                end_time: endUTC, 
                visibility: updatedEvent.visibility }),
        })

        if (!response.ok) {
            const errData = await response.json() ;
            throw new Error(errData.detail || "Failed to update event.") ;
        }

        window.location.reload() ;

    } catch(err) {
        setError(err.message) ;
    }
}

    return (
        <>
        <title>Calendar</title>
        <div>
            <h1>PlanPal: {formatted}</h1>
            <Navbar />
            <h2>Personal Events for {formatted}</h2>
            {error && <p style={{ color: "#f38ba8" }}>{error}</p>}
            
{events.length === 0 ? (
    !error && <p>No events for this day.</p>
) : (
    <Table striped bordered hover responsive>
        <thead>
            <tr>
                <th>Event Name</th>
                <th>Description</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Visibility</th>
                <th></th>
            </tr>
        </thead>

        <tbody>
            {events.map((ev) => {
                console.log(ev.eventID)
                const isExpanded = expandedEventID === ev.eventID;

                return (
                    <Fragment key={ev.eventID}>
                        <tr>
                            <td>{ev.title ?? "Private Event"}</td>
                            <td>{ev.description ?? "Details hidden"}</td>

                            <td>
                                {new Date(ev.start_time).toLocaleString(
                                    "en-US",
                                    { timeStyle: "short" }
                                )}
                            </td>

                            <td>
                                {new Date(ev.end_time).toLocaleString(
                                    "en-US",
                                    { timeStyle: "short" }
                                )}
                            </td>

                            <td>{ev.visibility}</td>

                            <td>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() =>
                                        setExpandedEventID(
                                            isExpanded ? null : ev.eventID
                                        )
                                    }
                                    aria-expanded={isExpanded}
                                    aria-label={
                                        isExpanded
                                            ? "Close event form"
                                            : "Open event form"
                                    }
                                >
                                    {isExpanded ? "▲" : "▼"}
                                </Button>
                            </td>
                        </tr>

                        <tr>
                            <td colSpan={6} className="p-0">
                                <div in={isExpanded}>
                                    <div hidden={!isExpanded} className="p-3">
                                        <EditEventForm
                                            event={ev}
                                            friends={friendsList}
                                            onUpdateEvent={updateEvent}
                                            sharedFriendshipIDs={sharedFriendshipIDs}
                                            onShareEvent={sharePrivate}
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </Fragment>
                );
            })}
        </tbody>
    </Table>
)}

            <h2>Friend's Events</h2>
            {friendEvents.length === 0 ? (!error && <p>Your friends have no events on this day.</p>) :
            (<table>
                <thead><th>Friend</th><th>Event Name</th><th>Event Description</th><th>Start Time</th><th>End Time</th></thead>
                <tbody>
                    {friendEvents.map((fe) => (
                        <tr key={fe.eventID}>
                            <td>{fe.friendName} ({fe.friendUsername})</td>
                            <td>{fe.title ?? "Private Event"}</td>
                            <td>{fe.description ?? "Details hidden."}</td>
                            <td>{new Date(fe.start_time).toLocaleString("en-US", {
                                timeStyle: "short",
                            })}</td>
                            <td>{new Date(fe.end_time).toLocaleString("en-US", {
                                timeStyle: "short",
                            })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>)}
            <p>Go <Link to={"/calendar?date=" + yesterday(dateParam)}>back</Link> a day. | Go <Link to={"/calendar?date=" + tomorrow(dateParam)}>forward</Link> a day.</p>
        </div>
        </>
    ) ;
} ;

export default Calendar ; 