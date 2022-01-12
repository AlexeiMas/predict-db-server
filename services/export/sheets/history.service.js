const {
  sheetOptions, alignmentStyle, greyHeaderStyle, blueHeaderStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Pre/Post Collection',
  'Regime',
  'Treatments',
  'Dose (mg/day or mg/kg)',
  'Treatment Duration (Months)',
  'Best Response (RECIST)',
  'PD Context',
  'Response Duration (Months)',
];

const prepareValues = (data) => data.reduce((acc, row) => {
  const history = row.TreatmentHistory;

  const modelInfo = [
    row['PDC Model'] || '',
    row['Primary Tumour Type'] || '',
    row['Tumour Sub-type'] || '',
  ];

  if (!history) return [...acc, ...modelInfo];

  const historyRows = history.map((item) => [
    ...modelInfo,
    ...[
      item['Pre/Post Collection'] || '',
      item.Regime || '',
      item.Treatment || '',
      item['Dose  (mg/day or mg/kg)'] || '', // TODO: Fix field name in the DB
      item['Treatment Duration (Months)'] || '',
      item['Best Response (RECIST)'] || '',
      item['PD Context'] || '',
      item['Response Duration (Months)'] || '',
    ],
  ]);

  return [...acc, ...historyRows];
}, []);

module.exports.createWorksheet = (workbook, data = []) => {
  if (data.length === 0 || !data[0].TreatmentHistory) return;

  const sheet = workbook.addWorksheet('Patient Treatment History', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(4, 1, 4, 4).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(4, 4, 4, 11).style({
    ...alignmentStyle,
    ...blueHeaderStyle,
  });

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
