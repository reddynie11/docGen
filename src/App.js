import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrgSelection from './pages/OrgSelection';
import DocTypeSelection from './pages/DocTypeSelection';
import FormPage from './pages/FormPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrgSelection />} />
      <Route path="/doctype" element={<DocTypeSelection />} />
      <Route path="/form" element={<FormPage />} />
    </Routes>
  );
}

export default App;
