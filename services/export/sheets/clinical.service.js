const {
  sheetOptions, alignmentStyle, greyHeaderStyle, greenHeaderStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Sex',
  'Age',
  'Ethnicity',
  'Diagnosis',
  'Stage',
  'Histology',
  'Breast Cancer Receptor Status',
  'Differentiation',
  'Treatment Status',
  'Sample Site',
  'Sample Type',
  'Smoking History',
];

const prepareValues = (data) => data.map((row) => [
  row['PDC Model'] || '',
  row['Primary Tumour Type'] || '',
  row['Tumour Sub-type'] || '',
  row.Sex || '',
  row.Age || '',
  row.Ethnicity || '',
  row.Diagnosis || '',
  row.Stage || '',
  row && row.Histology && row.Histology.length > 0
    ? row.Histology.join(' ,') : '',
  row
      && row['Breast Cancer Receptor Status']
      && row['Breast Cancer Receptor Status'].length > 0
    ? row['Breast Cancer Receptor Status'].join(' ,') : '',
  row.Differentiation || '',
  row['Treatment Status'] || '',
  row['Sample Collection Site'] || '',
  row['Sample Type'] || '',
  row['Smoking History'] || '',
]);

module.exports.createWorksheet = (workbook, data) => {
  const sheet = workbook.addWorksheet('Clinical', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(3, 3, 3, 6).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(3, 6, 3, 17).style({
    ...alignmentStyle,
    ...greenHeaderStyle,
  });

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
