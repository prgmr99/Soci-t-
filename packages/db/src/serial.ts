export function generateSerial(index: number): string {
  const year = new Date().getUTCFullYear();
  const padded = String(index).padStart(6, "0");
  return `S-${year}-${padded}`;
}
