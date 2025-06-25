import { useEffect } from 'react';
import { userDispatch, useSelector } from 'react-redux';
import { getMyTickets } from '../redux/ticketSlice';
import { Link } from 'react-router-dom';   


function DashboardPage() {
    const dispatch = userDispatch();
    const { tickets, loading } = useSelector((s) => s.tickets);

    useEffect(() => {
        dispatch(getMyTickets());
    }, [dispatch]);

    return (
        <div className="dashboard">
            <h2>My Ticket</h2>
            {loading ? <p>loading...</p> : (
                <>
                <Link to="/tickets/new">Create Ticket</Link>
                <ul>
                    {tickets.map(t => (
                        <li key={t._id}>
                            <Link to={`/tickets/${t._id}`}>{t.title} - {t.status}</Link>
                        </li>
                    ))}
                </ul>
                </>
            )}

        </div>
    );

}

export default DashboardPage;
