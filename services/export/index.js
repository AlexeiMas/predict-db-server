/* eslint-disable dot-notation */
const excel = require('excel4node');
const SHEETS = require('./sheets');

const createWorkbook = ({ data, includeExpressions, QueryInformation }) => {
  const workbook = new excel.Workbook({
    author: 'Imagen Therapeutics API',
    defaultFont: {
      size: 11,
      name: 'Calibri',
      color: 'FF000000',
    },
  });

  Object.keys(SHEETS).filter((service) => /queryInformation/gi.test(service) === false)
    .map(
      (service) => (/ngs/gi.test(service)
        ? SHEETS[service].createWorksheet({ workbook, data, includeExpressions })
        : SHEETS[service].createWorksheet(workbook, data)),
    );
  SHEETS['queryInformation'].createWorksheet({ workbook, QueryInformation });

  return workbook;
};

const writeFile = (workbook, response) => {
  workbook.write('PDB_Data_Export.xlsx', response);
};

const exportFile = ({ data, response, includeExpressions, QueryInformation }) => {
  const workbook = createWorkbook({ data, includeExpressions, QueryInformation });
  writeFile(workbook, response);
};

module.exports = { createWorkbook, writeFile, exportFile };
