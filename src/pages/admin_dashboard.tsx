import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

async function apiFetch(path, token, options = {}) {
    const res = await fetch(`https://api.raccoon2891.com${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.detail || "Request failed.");
        err.status = res.status;
        throw err;
    }
    return res.json();
}

function formatDate(value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [visibilityFilter, setVisibilityFilter] = useState("all");
    const [deletingId, setDeletingId] = useState(null);
    const [expandedIds, setExpandedIds] = useState(() => new Set());

    function handleApiError(err) {
        if (err.status === 401) {
            logout();
            navigate("/login", { replace: true });
            return;
        }
        if (err.status === 403) {
            navigate("/dashboard", { replace: true });
            return;
        }
        setError(err.message || "Something went wrong.");
    }

    function toggleExpanded(id) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        async function load() {
            try {
                const data = await apiFetch("/admin/events", token);
                if (!cancelled) setEvents(data);
            } catch (err) {
                if (!cancelled) handleApiError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function handleDelete(event) {
        const ok = window.confirm(
            `Delete "${event.title}" owned by ${event.username}? This cannot be undone.`
        );
        if (!ok) return;

        setDeletingId(event.eventID);
        setError("");
        try {
            await apiFetch(`/admin/events/${event.eventID}`, token, { method: "DELETE" });
            setEvents((prev) => prev.filter((e) => e.eventID !== event.eventID));
            setExpandedIds((prev) => {
                const next = new Set(prev);
                next.delete(event.eventID);
                return next;
            });
        } catch (err) {
            handleApiError(err);
        } finally {
            setDeletingId(null);
        }
    }

    const visibleEvents = useMemo(() => {
        const q = search.trim().toLowerCase();
        return events.filter((e) => {
            if (visibilityFilter !== "all" && e.visibility !== visibilityFilter) return false;
            if (!q) return true;
            return [e.title, e.description, e.username].some((v) =>
                (v || "").toLowerCase().includes(q)
            );
        });
    }, [events, search, visibilityFilter]);

    return (
        <>
            <title>Admin Dashboard</title>
            <div className="admin-dashboard">
                <header>
                    <h1 className="title_header">Admin Dashboard</h1>
                </header>
                <p>
                    Click here to <Link to="/" onClick={logout}>sign out</Link>.
                </p>
                <p>
                    Showing {visibleEvents.length} of {events.length} events (all users, including private).
                </p>

                {error && <p style={{ color: "#f38ba8" }}>{error}</p>}

                <div className="form-row">
                    <input
                        type="text"
                        placeholder="Search title, description, or owner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        value={visibilityFilter}
                        onChange={(e) => setVisibilityFilter(e.target.value)}
                    >
                        <option value="all">All visibility</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                        <option value="public">Public</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading events... (the server may take a moment to wake up)</p>
                ) : visibleEvents.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    <table className="admin-events-table">
                        <thead>
                            <tr>
                                <th aria-label="Details"></th>
                                <th>Title</th>
                                <th>Owner</th>
                                <th>Visibility</th>
                                <th aria-label="Actions"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleEvents.map((e) => {
                                const isOpen = expandedIds.has(e.eventID);
                                const detailsId = `event-details-${e.eventID}`;

                                return (
                                    <Fragment key={e.eventID}>
                                        <tr>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="expand-btn"
                                                    onClick={() => toggleExpanded(e.eventID)}
                                                    aria-expanded={isOpen}
                                                    aria-controls={detailsId}
                                                    aria-label={isOpen ? "Hide details" : "Show details"}
                                                >
                                                    {isOpen ? "▾" : "▸"}
                                                </button>
                                            </td>
                                            <td>{e.title}</td>
                                            <td>{e.username}</td>
                                            <td>{e.visibility}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(e)}
                                                    disabled={deletingId === e.eventID}
                                                >
                                                    {deletingId === e.eventID ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>

                                        {isOpen && (
                                            <tr id={detailsId} className="event-details-row">
                                                <td></td>
                                                <td colSpan={4}>
                                                    <dl className="event-details">
                                                        <dt>Description</dt>
                                                        <dd style={{ whiteSpace: "pre-wrap" }}>
                                                            {e.description || "No description."}
                                                        </dd>
                                                        <dt>Starts</dt>
                                                        <dd>{formatDate(e.start_time)}</dd>
                                                        <dt>Ends</dt>
                                                        <dd>{formatDate(e.end_time)}</dd>
                                                        <dt>Event ID / Owner ID</dt>
                                                        <dd>{e.eventID} / {e.ownerID}</dd>
                                                    </dl>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}