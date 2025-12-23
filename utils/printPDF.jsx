import { generatePDF } from "./generatePDF";

export const printPDF = async(cn, item) => {
    const pdfBlob = await generatePDF(cn, item);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      printWindow.onload = () => {
        printWindow.print();
      };

}