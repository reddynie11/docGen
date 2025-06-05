import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleSelect = (org) => {
    navigate("/document-type", { state: { org } });
  };

  return (
    <div className="home-container">
      <h2>Choose Organization</h2>
      <div className="card-wrapper">
        <div style={{ color: 'blue', backgroundColor: 'lightgray', padding: '20px' }} onClick={() => handleSelect("services")}>
          <h3>Kraftwise Services</h3>
          <p>Generate documents for Kraftwise Services team.</p>
        </div>
        <div className="org-card" onClick={() => handleSelect("solutions")}>
          <h3>Kraftwise Solutions</h3>
          <p>Generate documents for Kraftwise Solutions team.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
