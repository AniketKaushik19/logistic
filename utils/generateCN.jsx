export function generateConsignmentNumber() {
const rand = Math.floor(1000 + Math.random() * 9000);
const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
return `ALC-${date}-${rand}`;
}