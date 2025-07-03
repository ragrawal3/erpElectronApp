import { useEffect, useState } from "react";
import api from '../api';

function DashboardPage() {
    const [data, setData] = useState(0);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => res.data)
      .then(data => {
        if (data.success) {
          setData(data.data);
        } else {
          window.location.href = '/';
        }
      })
      .catch(err => {
        console.error('Error loading dashbord:', err);
        // window.location.href = '/';
      });
  }, [data.data]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Dashboard</h2>
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  );
}
export default DashboardPage;