import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import './SelectionPage.css'; // Optional: if shared CSS is in one file

const DocTypeSelection = () => {
  const navigate = useNavigate();
  const { setSelectedDocType } = useSelection();

  const handleSelect = (docType) => {
    setSelectedDocType(docType);
    navigate('/form');
  };

  return (
    <div className="form-container">
      <h2>Select Document Type</h2>
      <div className="card-button-group">
        <button className="card-button" onClick={() => handleSelect('Offer')}>Offer Letter</button>
        <button className="card-button" onClick={() => handleSelect('Relieving')}>Relieving Letter</button>
      </div>
    </div>
  );
};

export default DocTypeSelection;
