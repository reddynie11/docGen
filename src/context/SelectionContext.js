import React, { createContext, useState, useContext } from 'react';

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');

  return (
    <SelectionContext.Provider value={{ selectedOrg, setSelectedOrg, selectedDocType, setSelectedDocType }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => useContext(SelectionContext);
