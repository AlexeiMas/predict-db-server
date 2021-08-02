const excel = require('excel4node');
const SHEETS = require('./sheets');

const createWorkbook = ({ data, includeExpressions }) => {
  const workbook = new excel.Workbook({
    author: 'Imagen Therapeutics API',
    defaultFont: {
      size: 11,
      name: 'Calibri',
      color: 'FF000000',
    },
  });

  Object.keys(SHEETS)
    .map(
      (service) => (/ngs/gi.test(service)
        ? SHEETS[service].createWorksheet({ workbook, data, includeExpressions })
        : SHEETS[service].createWorksheet(workbook, data)),
    );

  return workbook;
};

const writeFile = (workbook, response) => {
  workbook.write('PTX_Data_Export.xlsx', response);
};

const exportFile = ({ data, response, includeExpressions }) => {
  const workbook = createWorkbook({ data, includeExpressions });
  writeFile(workbook, response);
};

module.exports = { createWorkbook, writeFile, exportFile };
