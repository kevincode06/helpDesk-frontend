import { useEffect, useState  } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getTicket, closeTicket } from '../redux/ticketSlice';
import { toast } from 'react-toastify';


function TicketPage() {
    const { id } = useParams();
    const dispatch = useDispatch()
    const { ticket, loading }= useSelector((s) => s.tickets);
    const [message, setMessage] = useState('');

    useEffect(() => {
        dispatch(getTicket(id));
    }, [dispatch, id]);

    const handleSupport = () => {
        dispatch(closeTicket({ id, statusData: { status: 'close', message }}))
        .unwrap()
        .then(() => toast.success('Ticket closed'))
        .catch(toast.error);
    };

    if (loading || !ticket) return <p>Loading...</p>;

    return (
        <div className="ticket-page">
            <h2>{ticket.title}</h2>
            <p>Status: {ticket.status}</p>

            {/* Display conversation */}

            <div>
                {ticket.message?.map((m, i) => (
                    <p key={i}>
                        <b>{m.user === ticket.user ? 'You' : 'Admin'}:</b> {m.message}</p>
                ))}
            </div>

            {/* Show input only if ticket is still open */}
            {ticket.status !== 'closed' && (
                <>
                <textarea value={message} onChange={e => setMessage(e.target.value)} />
                    <button onClick={handleSupport}>Send Support Message</button>

                </>
            )} 
        </div>
    );
}

export default TicketPage