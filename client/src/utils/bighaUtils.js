export const formatBighaBissaDisplay = (bigha = 0, bissa = 0) => {
  const b = parseInt(bigha) || 0;
  const bs = parseInt(bissa) || 0;
  if (b === 0 && bs === 0) return '-';
  return `${b} बीघा ${bs} बिस्सा (${b} Bigha ${bs} Bissa)`;
};

export const calculateBighaCost = (bigha = 0, bissa = 0, ratePerBigha = 0) => {
  const b = parseFloat(bigha) || 0;
  const bs = parseFloat(bissa) || 0;
  const r = parseFloat(ratePerBigha) || 0;
  const totalBissa = b * 20 + bs;
  const decimalBigha = totalBissa / 20;
  return Math.round(decimalBigha * r);
};
