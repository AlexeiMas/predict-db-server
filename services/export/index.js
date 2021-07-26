const excel = require('excel4node');
const {
  model, phenotypes, clinical, history, responses, ngs,
} = require('./sheets');

const SHEETS = [model, ngs, phenotypes, clinical, history, responses];

const createWorkbook = (data) => {
  const workbook = new excel.Workbook({
    author: 'Imagen Therapeutics API',
    defaultFont: {
      size: 11,
      name: 'Calibri',
      color: 'FF000000',
    },
  });

  SHEETS.map((item) => item.createWorksheet(workbook, data));

  return workbook;
};

const writeFile = (workbook, response) => {
  workbook.write('PTX_Data_Export.xlsx', response);
};

const exportFile = (data, response) => {
  const workbook = createWorkbook(data);
  writeFile(workbook, response);
};

module.exports = { createWorkbook, writeFile, exportFile };
