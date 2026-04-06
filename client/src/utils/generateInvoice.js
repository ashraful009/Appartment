import jsPDF from "jspdf";
import "jspdf-autotable";

export const downloadInvoice = (installment, unitDetails) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(10, 22, 40); // Navy blue
  doc.setFont("helvetica", "bold");
  doc.text("NIRAPOD NIBASH", 14, 22);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Premium Real Estate Platform", 14, 28);
  doc.text("Dhaka, Bangladesh", 14, 33);

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(10, 22, 40);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT INVOICE", 140, 22);

  // Invoice Meta
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  const invoiceDate = new Date(installment.invoiceDate).toLocaleDateString("en-GB");
  
  doc.text(`Invoice No: INV-${installment._id.substring(0, 8).toUpperCase()}`, 140, 30);
  doc.text(`Date: ${invoiceDate}`, 140, 35);
  doc.text(`Status: ${installment.status}`, 140, 40);
  
  // Line break
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // Customer Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Customer Name: ${unitDetails.customerName || "N/A"}`, 14, 62);
  doc.text(`Building Name: ${unitDetails.propertyId?.name || "N/A"}`, 14, 67);
  doc.text(`Unit Name/No: ${unitDetails.unitName || "N/A"} (Floor: ${unitDetails.floor || "N/A"})`, 14, 72);
  doc.text(`Installment: ${installment.installmentName}`, 14, 77);

  // Table Data
  const breakdown = installment.chargeBreakdown || {};
  const latePenalty = installment.latePenalty || 0;
  
  const tableData = [
    ["Base Amount", `BDT ${Number(breakdown.baseAmount || 0).toLocaleString()}`],
    ["Parking", `BDT ${Number(breakdown.parking || 0).toLocaleString()}`],
    ["Financial Service", `BDT ${Number(breakdown.financialService || 0).toLocaleString()}`],
    ["Service Charge", `BDT ${Number(breakdown.serviceCharge || 0).toLocaleString()}`],
  ];

  if (latePenalty > 0) {
    tableData.push(["Late Penalty", `BDT ${Number(latePenalty).toLocaleString()}`]);
  }

  // Draw Table
  doc.autoTable({
    startY: 85,
    head: [["Description", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [10, 22, 40] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: "auto", halign: "right" }
    },
    foot: [["Total Paid", `BDT ${Number(installment.totalAmount).toLocaleString()}`]],
    footStyles: { fillColor: [201, 148, 42], fontStyle: "bold", halign: "right" },
    showFoot: "lastPage"
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY || 150;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Thank you for your payment!", 14, finalY + 20);
  doc.text("For any queries, please contact info@nirapodnibash.com", 14, finalY + 25);

  // Save PDF
  doc.save(`Invoice_${installment.installmentName.replace(/[\s-/]+/g, "_")}.pdf`);
};
