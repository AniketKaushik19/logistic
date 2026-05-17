export function calculateNetPay({
  salary = 0,
  bonus = 0,
  advance = 0,
}) {
  return Number(salary) + Number(bonus)- Number(advance);
}
