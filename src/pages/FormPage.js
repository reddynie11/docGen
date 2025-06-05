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

//   const handleGenerateDoc = async () => {
//   if (isFieldMissing()) {
//     setError('Please fill in all mandatory fields.');
//     return;
//   }

//   setError('');

//   try {
//     const response = await fetch(`/templates/${templateFileName}`);
//     if (!response.ok) throw new Error('Template file not found');
//     const blob = await response.blob();
//     const arrayBuffer = await blob.arrayBuffer();
//     const zip = new PizZip(arrayBuffer);
//     const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

//     doc.setData(formData);

//     try {
//       doc.render();
//     } catch (err) {
//       console.error('Error rendering document:', err);
//       alert('Error generating document. Please check the template and fields.');
//       return;
//     }

//     const outDocx = doc.getZip().generate({ type: 'blob' });

//     // ⬇️ START Word → PDF Conversion via CloudConvert
//     const formDataUpload = new FormData();
//     formDataUpload.append('file', outDocx, templateFileName);

//     // Step 1: Upload the file to CloudConvert's import/upload task
//     const importResponse = await fetch("https://api.cloudconvert.com/v2/import/upload", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjM5NjE3MTZmNjk4ZTFjYTI4MWYwMzU2MTdmMjQwYmZjOTRhMzkwMDYyZTljMWVmYmE4NTUxNjQ5Yjk1YTliNDU1MTU5ZGZhMTc0M2NkODUiLCJpYXQiOjE3NDkxNDU4NjAuNTE0MDQ2LCJuYmYiOjE3NDkxNDU4NjAuNTE0MDQ3LCJleHAiOjQ5MDQ4MTk0NjAuNTEwNDUsInN1YiI6IjcyMTMzNzkwIiwic2NvcGVzIjpbInRhc2sucmVhZCIsInRhc2sud3JpdGUiXX0.KWGrnw3qyBjzwlGRoX3bkRT953JDY8Vn-AQhm_lU4Acxv9EFJ1ePeaidtHwjvTJ3ia1-CHg4GDJ4XfLSK2uokVjTzQ6oR7l72z0TAveUZDTxrAfnLNT44iotiLoWhfAGuOTIuWfNdyg8mzl0youzZTpji3vdpk6TMFctQzW2z_neS-vEXxAF8xF-OugoezkmMgrLlYAhAMRTQSt4h1hE9qhZLxOaXJg7ims79EJbjMUQ8m23iCvL1VlDMjzVfcNR2sOM2BRF_ZITRnk0gvotyAcFYAdRc2EFvRpKz_tN7fuMi5DFskAcGTAebjVKUsJ-C8l08-9iibxcXba7WMtYJ-bapeZ9Zpd-YD03Ffg72oTOlcW7Z7IxpV8UzYHYoHSBYddLZXthu7XPz8D-2_EVbRp3hIvhCBpOrvn0x_Bbr_pcPAmCqQgOHkwrzSptTDwde5VTcbapS3fv6xQLNgRCKuXEfNJW-Y5NKaTypCnjYt_v4z8OYzlhToL26MEwGOhIRNMJU_TA6pstOzUVJM1i-rH15R21vAG0olXkt8YatqmT4iOqEZcNDzYawjpk_8X16iUIuM9lUgBbuf89n7kB1H86X6fTfKfm1ikszHua9_GtWRQcVxZskr4NAL7I_ypKv3FvD7627ASWWsVs4PpgcbKpvAuiG_OkUKOvhumxubs", // replace with real API Key
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         name: templateFileName
//       })
//     });
//     const importData = await importResponse.json();

//     // Step 2: Upload the file to the given upload URL
//     await fetch(importData.data.result.form.url, {
//       method: 'PUT',
//       body: outDocx,
//     });

//     // Step 3: Create a conversion task
//     const convertResponse = await fetch("https://api.cloudconvert.com/v2/convert", {
//       method: "POST",
//       headers: {
//         Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjM5NjE3MTZmNjk4ZTFjYTI4MWYwMzU2MTdmMjQwYmZjOTRhMzkwMDYyZTljMWVmYmE4NTUxNjQ5Yjk1YTliNDU1MTU5ZGZhMTc0M2NkODUiLCJpYXQiOjE3NDkxNDU4NjAuNTE0MDQ2LCJuYmYiOjE3NDkxNDU4NjAuNTE0MDQ3LCJleHAiOjQ5MDQ4MTk0NjAuNTEwNDUsInN1YiI6IjcyMTMzNzkwIiwic2NvcGVzIjpbInRhc2sucmVhZCIsInRhc2sud3JpdGUiXX0.KWGrnw3qyBjzwlGRoX3bkRT953JDY8Vn-AQhm_lU4Acxv9EFJ1ePeaidtHwjvTJ3ia1-CHg4GDJ4XfLSK2uokVjTzQ6oR7l72z0TAveUZDTxrAfnLNT44iotiLoWhfAGuOTIuWfNdyg8mzl0youzZTpji3vdpk6TMFctQzW2z_neS-vEXxAF8xF-OugoezkmMgrLlYAhAMRTQSt4h1hE9qhZLxOaXJg7ims79EJbjMUQ8m23iCvL1VlDMjzVfcNR2sOM2BRF_ZITRnk0gvotyAcFYAdRc2EFvRpKz_tN7fuMi5DFskAcGTAebjVKUsJ-C8l08-9iibxcXba7WMtYJ-bapeZ9Zpd-YD03Ffg72oTOlcW7Z7IxpV8UzYHYoHSBYddLZXthu7XPz8D-2_EVbRp3hIvhCBpOrvn0x_Bbr_pcPAmCqQgOHkwrzSptTDwde5VTcbapS3fv6xQLNgRCKuXEfNJW-Y5NKaTypCnjYt_v4z8OYzlhToL26MEwGOhIRNMJU_TA6pstOzUVJM1i-rH15R21vAG0olXkt8YatqmT4iOqEZcNDzYawjpk_8X16iUIuM9lUgBbuf89n7kB1H86X6fTfKfm1ikszHua9_GtWRQcVxZskr4NAL7I_ypKv3FvD7627ASWWsVs4PpgcbKpvAuiG_OkUKOvhumxubs",
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         input: "import/upload",
//         file: importData.data.filename,
//         output_format: "pdf"
//       })
//     });
//     const convertData = await convertResponse.json();

//     // Step 4: Wait for conversion to complete
//     const jobId = convertData.data.job_id;

//     let pdfUrl = null;
//     for (let i = 0; i < 10; i++) {
//       await new Promise(res => setTimeout(res, 2000));
//       const jobStatus = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
//         headers: {
//           Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNjM5NjE3MTZmNjk4ZTFjYTI4MWYwMzU2MTdmMjQwYmZjOTRhMzkwMDYyZTljMWVmYmE4NTUxNjQ5Yjk1YTliNDU1MTU5ZGZhMTc0M2NkODUiLCJpYXQiOjE3NDkxNDU4NjAuNTE0MDQ2LCJuYmYiOjE3NDkxNDU4NjAuNTE0MDQ3LCJleHAiOjQ5MDQ4MTk0NjAuNTEwNDUsInN1YiI6IjcyMTMzNzkwIiwic2NvcGVzIjpbInRhc2sucmVhZCIsInRhc2sud3JpdGUiXX0.KWGrnw3qyBjzwlGRoX3bkRT953JDY8Vn-AQhm_lU4Acxv9EFJ1ePeaidtHwjvTJ3ia1-CHg4GDJ4XfLSK2uokVjTzQ6oR7l72z0TAveUZDTxrAfnLNT44iotiLoWhfAGuOTIuWfNdyg8mzl0youzZTpji3vdpk6TMFctQzW2z_neS-vEXxAF8xF-OugoezkmMgrLlYAhAMRTQSt4h1hE9qhZLxOaXJg7ims79EJbjMUQ8m23iCvL1VlDMjzVfcNR2sOM2BRF_ZITRnk0gvotyAcFYAdRc2EFvRpKz_tN7fuMi5DFskAcGTAebjVKUsJ-C8l08-9iibxcXba7WMtYJ-bapeZ9Zpd-YD03Ffg72oTOlcW7Z7IxpV8UzYHYoHSBYddLZXthu7XPz8D-2_EVbRp3hIvhCBpOrvn0x_Bbr_pcPAmCqQgOHkwrzSptTDwde5VTcbapS3fv6xQLNgRCKuXEfNJW-Y5NKaTypCnjYt_v4z8OYzlhToL26MEwGOhIRNMJU_TA6pstOzUVJM1i-rH15R21vAG0olXkt8YatqmT4iOqEZcNDzYawjpk_8X16iUIuM9lUgBbuf89n7kB1H86X6fTfKfm1ikszHua9_GtWRQcVxZskr4NAL7I_ypKv3FvD7627ASWWsVs4PpgcbKpvAuiG_OkUKOvhumxubs"
//         }
//       });
//       const jobData = await jobStatus.json();
//       const exportTask = jobData.data.tasks.find(task => task.name === 'export/url' && task.status === 'finished');
//       if (exportTask) {
//         pdfUrl = exportTask.result.files[0].url;
//         break;
//       }
//     }

//     if (pdfUrl) {
//       const pdfBlob = await fetch(pdfUrl).then(res => res.blob());
//       saveAs(pdfBlob, `${templateFileName.replace('.docx', '')}_Final.pdf`);
//     } else {
//       alert("PDF generation timed out or failed.");
//     }

//   } catch (err) {
//     console.error('Error processing document:', err);
//     alert('Failed to convert and download document.');
//   }
// };

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

    const docxBlob = doc.getZip().generate({ type: 'blob' });

    // 🟢 Upload DOCX to PDF.co storage
    const uploadedDocxUrl = await uploadToPDFCoStorage(docxBlob);

    // 🟢 Convert DOCX URL to PDF
    await convertDocxUrlToPdfViaPDFCo(uploadedDocxUrl, templateFileName.replace('.docx', '.pdf'));

  } catch (err) {
    console.error('Error processing document:', err);
    alert(`Failed to generate PDF: ${err.message}`);
  }
};
  

// const handleGenerateDoc = async () => {
//     if (isFieldMissing()) {
//       setError('Please fill in all mandatory fields.');
//       return;
//     }

//     setError('');

//     try {
//       const response = await fetch(`/templates/${templateFileName}`);
//       if (!response.ok) throw new Error('Template file not found');
//       const blob = await response.blob();
//       const arrayBuffer = await blob.arrayBuffer();
//       const zip = new PizZip(arrayBuffer);
//       const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

//       doc.setData(formData);

//       try {
//         doc.render();
//       } catch (err) {
//         console.error('Error rendering document:', err);
//         alert('Error generating document. Please check the template and fields.');
//         return;
//       }

//       const out = doc.getZip().generate({ type: 'blob' });
//       //saveAs(out, `${templateFileName.replace('.docx', '')}_.docx`);
//       await convertDocxToPdfViaPDFCo(out, templateFileName.replace('.docx', '.pdf'));
//     } catch (err) {
//       console.error('Error loading template:', err);
//       alert('Failed to generate document. Template not found or error in processing.');
//     }
//   };

  const uploadToPDFCoStorage = async (docxBlob) => {
  const formData = new FormData();
  formData.append("file", docxBlob, "temp.docx");

  const response = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: {
      "x-api-key": "reddy.nie11@gmail.com_sQSbuZpJrDoLzheAeWqb01rdcSNs69PWU9W2FuEAa5NJXCJ8Y3BHCmx5lsw7hex2" // 🔐 Replace with your actual key
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.message || "Failed to upload file to PDF.co");
  }

  return data.url; // Public URL to uploaded file
};

const convertDocxUrlToPdfViaPDFCo = async (docxUrl, outputFileName) => {
  const response = await fetch("https://api.pdf.co/v1/pdf/convert/from/doc", {
    method: "POST",
    headers: {
      "x-api-key": "reddy.nie11@gmail.com_sQSbuZpJrDoLzheAeWqb01rdcSNs69PWU9W2FuEAa5NJXCJ8Y3BHCmx5lsw7hex2",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: docxUrl,
      name: outputFileName,
      async: false
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.message || "PDF conversion failed");
  }

  const pdfBlob = await fetch(data.url).then((r) => r.blob());
  saveAs(pdfBlob, outputFileName);
};



  const convertDocxToPdfViaPDFCo = async (docBlob, outputFileName) => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async function () {
      const base64docx = reader.result.split(',')[1];

      const response = await fetch("https://api.pdf.co/v1/pdf/convert/from/doc", {
        method: "POST",
        headers: {
          "x-api-key": "reddy.nie11@gmail.com_sQSbuZpJrDoLzheAeWqb01rdcSNs69PWU9W2FuEAa5NJXCJ8Y3BHCmx5lsw7hex2",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: outputFileName,
          file: base64docx,
          async: false
        })
      });

      const data = await response.json();

      if (data.error) {
        reject(data.message);
      } else {
        const pdfBlob = await fetch(data.url).then(r => r.blob());
        saveAs(pdfBlob, outputFileName);
        resolve();
      }
    };

    reader.onerror = () => reject("Failed to read file as base64");
    reader.readAsDataURL(docBlob);
  });
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
