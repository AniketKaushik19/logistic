export function calculateNetPay({
  baseSalary = 0,
  advance = 0,
}) {
  return Number(baseSalary)  - Number(advance);
}
