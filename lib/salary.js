export function calculateNetPay({
  baseSalary = 0,
  bonus = 0,
  penalty = 0,
  advance = 0,
}) {
  return Number(baseSalary) + Number(bonus) - Number(penalty) - Number(advance);
}
