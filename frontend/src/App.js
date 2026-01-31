import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, slotsRes, tokensRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctors`),
        axios.get(`${API_URL}/api/slots`),
        axios.get(`${API_URL}/api/tokens`)
      ]);
      setDoctors(doctorsRes.data.data || []);
      setSlots(slotsRes.data.data || []);
      setTokens(tokensRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
        alert('Cannot connect to server!\n\nMake sure:\n1. Backend server is running (npm run dev)\n2. Server is on port 5000\n3. Check console for details');
      } else {
        alert(`Error loading data: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const tokenData = {
      doctor_id: formData.get('doctor_id'),
      patient_name: formData.get('patient_name'),
      source: formData.get('source'),
      is_emergency: formData.get('is_emergency') === 'on'
    };

    try {
      const response = await axios.post(`${API_URL}/api/tokens`, tokenData);
      if (response.data.success) {
        alert(`Token created: ${response.data.token.token_number}`);
        fetchData();
        e.target.reset();
      } else {
        alert(`Token created but not allocated: ${response.data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OPD Token Allocation System</h1>
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'tokens' ? 'active' : ''}
          onClick={() => setActiveTab('tokens')}
        >
          Tokens
        </button>
        <button 
          className={activeTab === 'doctors' ? 'active' : ''}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors
        </button>
        <button 
          className={activeTab === 'slots' ? 'active' : ''}
          onClick={() => setActiveTab('slots')}
        >
          Slots
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create Token
        </button>
      </div>

      <div className="content">
        {activeTab === 'tokens' && (
          <div className="section">
            <h2>Tokens ({tokens.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Token Number</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map(token => (
                    <tr key={token._id}>
                      <td>{token.token_number}</td>
                      <td>{token.patient_name}</td>
                      <td>{token.doctor_id?.name || 'N/A'}</td>
                      <td>{token.source}</td>
                      <td>
                        <span className={`status status-${token.status}`}>
                          {token.status}
                        </span>
                      </td>
                      <td>{token.priority_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="section">
            <h2>Doctors ({doctors.length})</h2>
            <div className="cards">
              {doctors.map(doctor => (
                <div key={doctor._id} className="card">
                  <h3>{doctor.name}</h3>
                  <p>{doctor.specialization || 'No specialization'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'slots' && (
          <div className="section">
            <h2>Time Slots ({slots.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Capacity</th>
                    <th>Current</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => {
                    const available = slot.max_capacity - slot.current_count;
                    const utilization = (slot.current_count / slot.max_capacity) * 100;
                    return (
                      <tr key={slot._id}>
                        <td>{slot.doctor_id?.name || 'N/A'}</td>
                        <td>{new Date(slot.start_time).toLocaleString()}</td>
                        <td>{new Date(slot.end_time).toLocaleString()}</td>
                        <td>{slot.max_capacity}</td>
                        <td>{slot.current_count}</td>
                        <td>
                          <span className={available === 0 ? 'full' : ''}>
                            {available} ({utilization.toFixed(0)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="section">
            <h2>Create New Token</h2>
            <form onSubmit={createToken} className="form">
              <div className="form-group">
                <label>Doctor:</label>
                <select name="doctor_id" required>
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Patient Name:</label>
                <input type="text" name="patient_name" required />
              </div>

              <div className="form-group">
                <label>Source:</label>
                <select name="source" required>
                  <option value="online_booking">Online Booking</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="paid_priority">Paid Priority</option>
                  <option value="follow_up">Follow-up</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" name="is_emergency" />
                  Emergency
                </label>
              </div>

              <button type="submit">Create Token</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
