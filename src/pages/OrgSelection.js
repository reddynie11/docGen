import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import './SelectionPage.css';

const OrgSelection = () => {
  const navigate = useNavigate();
  const { setSelectedOrg } = useSelection();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const { username, password } = loginData;

    if (username === 'admin' && password === 'admin@docsign') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleSelect = (org) => {
    setSelectedOrg(org);
    navigate('/doctype');
  };

  return (
    <div className="form-container">
      {!isLoggedIn ? (
        <div className="login-box">
          <h2 className="login-title">Login to Continue</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      ) : (
        <>
          <h2>Select Organization</h2>
          <div className="card-button-group">
            <button className="card-button" onClick={() => handleSelect('Services')}>
              KraftWise Services
            </button>
            <button className="card-button" onClick={() => handleSelect('Solutions')}>
              KraftWise Solutions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrgSelection;
