
import { useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';

export const useExportPdf = () => {
  const pdfRef = useRef(null);

  const exportToPdf = useCallback((fileName = 'hoa-don-tien-tro.pdf') => {
    if (!pdfRef.current) return;

    const options = {
      margin: 10,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(options).from(pdfRef.current).save();
  }, []);

  return { pdfRef, exportToPdf };
};