import { useEffect, useState } from 'react';
import API from '../../api';

function TestBackend() {
  const [farmers, setFarmers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/farmers')
      .then((response) => {
        setFarmers(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError('Could not connect to backend');
      });
  }, []);

  return (
    <div>
      <h1>Farmers from PostgreSQL</h1>

      {error && <p>{error}</p>}

      {farmers.map((farmer) => (
        <div key={farmer.id}>
          <h2>{farmer.full_name}</h2>
          <p>Phone: {farmer.phone_number}</p>
        </div>
      ))}
    </div>
  );
}

export default TestBackend;