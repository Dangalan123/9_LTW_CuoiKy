import { useRef, useCallback, useState } from 'react';
import html2pdf from 'html2pdf.js';

const sanitizeUnsupportedColors = (clonedDoc) => {
  if (!clonedDoc) return;

  const view = clonedDoc.defaultView || window;
  const targets = [clonedDoc.documentElement, clonedDoc.body, ...clonedDoc.querySelectorAll('*')];

  targets.forEach((el) => {
    if (!el || !el.style) return;
    const computed = view.getComputedStyle(el);

    if (computed.color && computed.color.includes('oklch')) {
      el.style.color = '#0f172a';
    }
    if (computed.backgroundColor && computed.backgroundColor.includes('oklch')) {
      el.style.backgroundColor = '#ffffff';
    }
    if (computed.borderColor && computed.borderColor.includes('oklch')) {
      el.style.borderColor = '#e2e8f0';
    }
  });
};

export const useExportPdf = () => {
  const pdfRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(
    async (fileName = 'hoa-don-tien-tro.pdf') => {
      if (!pdfRef.current || isExporting) return;

      setIsExporting(true);

      const options = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          logging: false,
          onclone: (clonedDoc) => {
            sanitizeUnsupportedColors(clonedDoc);
          },
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      try {
        await new Promise((resolve) => setTimeout(resolve, 30));
        await html2pdf().set(options).from(pdfRef.current).save();
      } catch (error) {
        console.error('Lỗi khi xuất file PDF:', error);
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  return { pdfRef, exportToPdf, isExporting };
};