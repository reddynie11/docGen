import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { useSelection } from '../context/SelectionContext';
import './FormPage.css';

// Helper function: number to Indian currency format with commas
const formatIndianNumber = (num) => {
  if (num === '' || num === null || isNaN(num)) return '';
  const x = num.toString().split('.');
  let integerPart = x[0];
  let lastThree = integerPart.substring(integerPart.length - 3);
  let otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedOtherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return formattedOtherNumbers + lastThree;
};

// Helper function to convert number to words (Indian numbering system)
const numberToWords = (num) => {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'Overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + '' : '';
  return str.trim() + ' only';
};

const FormPage = () => {
  const { selectedOrg, selectedDocType } = useSelection();

  const [formData, setFormData] = useState({
    full_name: '',
    designation: '',
    joining_date: '',
    package: '',
    basic_monthly: '',
    basic_yearly: '',
    hra_monthly: '',
    hra_yearly: '',
    special_allowance_monthly: '',
    special_allowance_yearly: '',
    last_working_day: '',
    document_date: '',
    ctc: '',
    ctc_in_words: '',
  });

  const [error, setError] = useState('');

  // Calculate and format CTC breakup & values whenever package changes and doc type is Offer
  useEffect(() => {
    if (selectedDocType === 'Offer') {
      const pkg = parseFloat(formData.package);
      if (!isNaN(pkg) && pkg > 0) {
        // Calculate raw values
        const basicMonthly = Math.round(pkg * 0.4);
        const hraMonthly = Math.round(pkg * 0.3);
        const specialMonthly = Math.round(pkg * 0.3);
        const ctcValue = Math.round(pkg * 12);

        // Format to Indian currency number format
        setFormData(prev => ({
          ...prev,
          basic_monthly: formatIndianNumber(basicMonthly),
          basic_yearly: formatIndianNumber(basicMonthly * 12),
          hra_monthly: formatIndianNumber(hraMonthly),
          hra_yearly: formatIndianNumber(hraMonthly * 12),
          special_allowance_monthly: formatIndianNumber(specialMonthly),
          special_allowance_yearly: formatIndianNumber(specialMonthly * 12),
          ctc: formatIndianNumber(ctcValue),
          ctc_in_words: numberToWords(ctcValue),
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          basic_monthly: '',
          basic_yearly: '',
          hra_monthly: '',
          hra_yearly: '',
          special_allowance_monthly: '',
          special_allowance_yearly: '',
          ctc: '',
          ctc_in_words: '',
        }));
      }
    }
  }, [formData.package, selectedDocType]);

  if (!selectedOrg || !selectedDocType) {
    return (
      <div className="form-container">
        <h2>Error: Missing selection. Please go back and choose organization and document type.</h2>
      </div>
    );
  }

  const templateFileName = `KraftWise_${selectedOrg}_${selectedDocType}.docx`;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFieldMissing = () => {
    if (selectedDocType === 'Offer') {
      return (
        !formData.full_name ||
        !formData.designation ||
        !formData.joining_date ||
        !formData.package ||
        !formData.document_date
      );
    } else if (selectedDocType === 'Relieving') {
      return !formData.full_name || !formData.designation || !formData.last_working_day || !formData.document_date;
    }
    return false;
  };

  const handleGenerateDoc = async () => {
    if (isFieldMissing()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setError('');

    try {
      const response = await fetch(`/templates/${templateFileName}`);
      if (!response.ok) throw new Error('Template file not found');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      doc.setData(formData);

      try {
        doc.render();
      } catch (err) {
        console.error('Error rendering document:', err);
        alert('Error generating document. Please check the template and fields.');
        return;
      }

      const out = doc.getZip().generate({ type: 'blob' });
      saveAs(out, `${templateFileName.replace('.docx', '')}_${full_name}.docx`);
    } catch (err) {
      console.error('Error loading template:', err);
      alert('Failed to generate document. Template not found or error in processing.');
    }
  };

  return (
    <div className="form-container">
      <h2>{`Generate ${selectedDocType} Letter for ${selectedOrg}`}</h2>

      {error && <p className="error">{error}</p>}

      <label>Full Name</label>
      <input
        type="text"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        required
      />

      <label>Designation</label>
      <input
        type="text"
        name="designation"
        value={formData.designation}
        onChange={handleChange}
        required
      />

      <label>Document Date</label>
      <input
        type="date"
        name="document_date"
        value={formData.document_date}
        onChange={handleChange}
        required
      />

      <label>Joining Date</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            required
          />

      {selectedDocType === 'Offer' && (
        <>
          

          <label>Package (Monthly CTC)</label>
          <input
            type="number"
            name="package"
            value={formData.package}
            onChange={handleChange}
            required
            min="0"
          />
        </>
      )}

      {selectedDocType === 'Relieving' && (
        <>
          <label>Last Working Day</label>
          <input
            type="date"
            name="last_working_day"
            value={formData.last_working_day}
            onChange={handleChange}
            required
          />
        </>
      )}

      <button onClick={handleGenerateDoc}>Generate & Download</button>
    </div>
  );
};

export default FormPage;
