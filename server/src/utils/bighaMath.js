/**
 * Bigha-Bissa Mathematical Helper
 * Standard for user region: 1 Bigha = 20 Bissa
 */

const calculateTotalBissa = (bigha = 0, bissa = 0) => {
  const b = parseFloat(bigha) || 0;
  const bis = parseFloat(bissa) || 0;
  return Math.round((b * 20) + bis);
};

const formatBighaBissa = (totalBissa = 0) => {
  const tb = parseInt(totalBissa) || 0;
  const bigha = Math.floor(tb / 20);
  const bissa = tb % 20;
  return `${bigha} बीघा ${bissa} बिस्सा (${bigha} Bigha ${bissa} Bissa)`;
};

const calculateAmount = (unit, rate, { bigha = 0, bissa = 0, hours = 0, trips = 0, quantity = 0 }) => {
  const r = parseFloat(rate) || 0;
  const normalizedUnit = (unit || '').toLowerCase();

  if (normalizedUnit === 'bigha') {
    const totalBissa = calculateTotalBissa(bigha, bissa);
    const decimalBigha = totalBissa / 20;
    return Math.round(decimalBigha * r);
  } else if (normalizedUnit === 'hour') {
    const h = parseFloat(hours) || 0;
    return Math.round(h * r);
  } else if (normalizedUnit === 'trip') {
    const t = parseFloat(trips) || 0;
    return Math.round(t * r);
  } else if (normalizedUnit === 'quintal') {
    const q = parseFloat(quantity) || 0;
    return Math.round(q * r);
  } else {
    // Custom
    const q = parseFloat(quantity) || 1;
    return Math.round(q * r);
  }
};

module.exports = {
  calculateTotalBissa,
  formatBighaBissa,
  calculateAmount,
};
