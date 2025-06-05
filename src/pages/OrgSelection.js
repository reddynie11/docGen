import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import './SelectionPage.css'; // make sure this is included

const OrgSelection = () => {
  const navigate = useNavigate();
  const { setSelectedOrg } = useSelection();

  const handleSelect = (org) => {
    setSelectedOrg(org);
    navigate('/doctype');
  };

  return (
    <div className="form-container">
      <h2>Select Organization</h2>
      <div className="card-button-group">
        <button className="card-button" onClick={() => handleSelect('Services')}>
          KraftWise Services
        </button>
        <button className="card-button" onClick={() => handleSelect('Solutions')}>
          KraftWise Solutions
        </button>
      </div>
    </div>
  );
};

export default OrgSelection;
