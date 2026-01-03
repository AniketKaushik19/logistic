import { generatePDF } from "./generatePDF";

export const printPDF = async (cn, item) => {
  const pdfBlob = await generatePDF(cn, item);

  // Create a temporary URL for the blob
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Open new window for print
  const printWindow = window.open(pdfUrl);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  } else {
    alert("Pop-up blocked! Please allow pop-ups to print PDF.");
  }

  // Optional: Download PDF with custom name
  const fileName = `Consignment-${cn}.pdf`;
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = fileName;
  link.click();

  // Clean up the blob URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 1000);
};
