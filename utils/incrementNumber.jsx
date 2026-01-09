// Utility function
export default function incrementBillNo(billNo) {
  const [prefix, numberPart] = billNo.split("-");
  const nextNumber = parseInt(numberPart, 10) + 1;
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`; 
  // padStart ensures BL-001, BL-002, etc.
}
