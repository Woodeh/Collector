import type { Figure } from '../../types/figure';

interface ReportOptions {
  figures: Figure[];
  userName: string;
  locale: 'en' | 'ru';
}

export const generateCollectionReport = async ({ figures, userName, locale }: ReportOptions) => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const pdfDoc = new jsPDF();
  const isRussian = locale === 'ru';
  const timestamp = new Date().toLocaleString(locale);

  pdfDoc.setFillColor(18, 18, 18);
  pdfDoc.rect(0, 0, 210, 40, 'F');
  pdfDoc.setTextColor(59, 130, 246);
  pdfDoc.setFontSize(22);
  pdfDoc.text('FIGURE.COLLECTOR', 15, 22);
  pdfDoc.setTextColor(150, 150, 150);
  pdfDoc.setFontSize(9);
  pdfDoc.text(isRussian ? 'COLLECTION ASSET REPORT' : 'SYSTEM GENERATED ASSET LOG // SECURE ARCHIVE', 15, 30);
  pdfDoc.setFontSize(8);
  pdfDoc.text(`${isRussian ? 'CREATED' : 'GENERATED'}: ${timestamp}`, 140, 22);
  pdfDoc.text(`${isRussian ? 'OWNER' : 'OWNER'}: ${userName.toUpperCase()}`, 140, 28);

  const tableData = figures
    .filter((figure) => figure.conditionGrade?.toLowerCase().trim() !== 'pre-order')
    .sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    .map((figure) => [
      figure.name || 'Unknown Item', figure.anime || 'N/A', figure.brand || 'Original',
      `$${Number(figure.price || 0).toLocaleString()}`, figure.conditionGrade || 'Standard',
    ]);

  autoTable(pdfDoc, {
    startY: 50,
    head: [['DESIGNATION', 'ORIGIN', 'MANUFACTURER', 'EST. VALUE', 'STATUS']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });
  pdfDoc.save(`Collection_Report_${userName}_${new Date().toISOString().split('T')[0]}.pdf`);
};
