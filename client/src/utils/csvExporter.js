export const exportToCSV = (filename, headers, rows) => {
  if (!rows || !rows.length) return;

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const stringified = String(str).replace(/"/g, '""');
    return `"${stringified}"`;
  };

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.map(escapeCSV).join(',') + '\n';

  rows.forEach((row) => {
    const rowValues = Array.isArray(row) ? row : Object.values(row);
    csvContent += rowValues.map(escapeCSV).join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
