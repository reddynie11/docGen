import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DocumentType.css";

const DocumentType = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const org = location.state?.org;

  const handleSelect = (docType) => {
    navigate("/form", {
      state: {
        org,
        docType,
      },
    });
  };

  if (!org) {
    return <p style={{ padding: "20px" }}>❌ Organization not selected.</p>;
  }

  const orgLabel =
    org === "services" ? "Kraftwise Services" : "Kraftwise Solutions";

  return (
    <div className="doc-type-container">
      <h2>{orgLabel} - Select Document Type</h2>
      <div className="card-wrapper">
        <div className="doc-card" onClick={() => handleSelect("offer")}>
          <h3>Offer Letter</h3>
          <p>Generate a personalized offer letter.</p>
        </div>
        <div className="doc-card" onClick={() => handleSelect("relieving")}>
          <h3>Relieving Letter</h3>
          <p>Generate an official relieving letter.</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentType;
