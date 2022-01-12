const {
  sheetOptions, alignmentStyle, blueHeaderStyle, greyHeaderStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Model status',
  'Growth Characteristics',
  '3D Model Status',
  'Patient Sequential Models',
  'NGS',
  'Has Patient Treatment History',
  'Has NGS Data',
  'Has PredictRx Response Data',
  'Has Growth Characteristics',
];

const prepareValues = (data) => data.map((row) => {
  const model = row.Model;

  return [
    row && row['PDC Model'] ? row['PDC Model'] : '',
    row && row['Primary Tumour Type'] ? row['Primary Tumour Type'] : '',
    row && row['Tumour Sub-type'] ? row['Tumour Sub-type'] : '',
    model && model['Model Status'] ? model['Model Status'] : '',
    model && model['Growth Characteristics'] ? model['Growth Characteristics'] : '',
    model && model['3D Model Status'] ? model['3D Model Status'] : '',
    model && model['Patient Sequential Models'] ? model['Patient Sequential Models'] : '',
    model && model.NGS ? model.NGS : '',
    model && model['Has Patient Treatment History'] ? 'Yes' : 'No',
    model && model['Has NGS Data'] ? 'Yes' : 'No',
    row && row['Has PredictRx Response Data'] ? 'Yes' : 'No',
    model && model['Has Growth Characteristics'] ? 'Yes' : 'No',
  ];
});

module.exports.createWorksheet = (workbook, data = []) => {
  if (data.length === 0) return;
  const sheet = workbook.addWorksheet('PDC Model Info', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(4, 1, 4, 4).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(4, 4, 4, 12).style({
    ...alignmentStyle,
    ...blueHeaderStyle,
  });

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
