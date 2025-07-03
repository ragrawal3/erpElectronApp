import { useEffect, useState } from 'react';
import api from '../api';
import '../css/SelectFirm.css';

function FirmSelectionPage() {
  const [firms, setFirms] = useState([]);
  const [message, setMessage] = useState('');
  // Dev
  const [sessionDetails, setSessionDetails] = useState('');

  useEffect(() => {
    // Fetch firms linked to logged-in user
    api.get('/userRoutes/firmsForUser')
      .then(res => res.data)
      .then(data => {
        if (data.success) {
          console.log(data);
          setFirms(data.data);
        } else {
          setMessage(data.message || 'Failed to load firms');
        }
      })
      .catch(err => {
        console.error('Error loading firm:', err);
        setMessage('Server error');
      });
  }, []);

  const handleSelectFirm = (firm_id) => {
    api.post(`/firmRoutes/selectFirm`, JSON.stringify({ firm_id }))
      .then(res => res.data)
      .then(data => {
        if (data.success) {
          window.location.href = '/dashboard';
        } else {
          setMessage(data.message || 'Firm selection failed');
        }
      })
      .catch(err => {
        console.error('Error selecting firm:', err);
        setMessage('Server error');
      });
  };

  // Dev
  const checkSession = async() => {
    try {
      const res = await api.get('');
      setSessionDetails(`Logged in as: ${res.data.loggedInUser.username}`);
      console.log(JSON.stringify(sessionDetails));
    } catch(err) {
      console.log(err);
      setSessionDetails(`No Active Session`);
    }
  }

  return (
    <div className='container'>
      <div className='card'>
        <h2>Select a Firm</h2>
        {firms.length === 0 && <p>{message || 'No firms available'}</p>}
        <ul className='list'>
          {firms.map(firm => (
            <li key={firm.id} className='item'>
              <button className='button' onClick={() => handleSelectFirm(firm.id)}>
                {firm.name}
              </button>
            </li>
          ))}
        </ul>
        {message && <p className='message'>{message}</p>}
      </div>
      {/* Dev */}
      <button className='button' onClick={() => checkSession()}>Check Session</button>
      <h2>{sessionDetails}</h2>
    </div>
  );
}

export default FirmSelectionPage;