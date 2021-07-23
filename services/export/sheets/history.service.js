const {
  sheetOptions, alignmentStyle, greyHeaderStyle, greenHeaderStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Pre/Post Collection',
  'Regime',
  'Treatments',
  'Date Started',
  'Date of Last Treatment',
  'Dose (mg/day or mg/kg)',
  'Treatment Duration (Months)',
  'Best Response (RECIST)',
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
      item['Date Started'] || '',
      item['Date of Last Treatment'] || '',
      item['Dose  (mg/day or mg/kg)'] || '', // TODO: Fix field name in the DB
      Number.isFinite(item['Treatment Duration (Months)']) ? item['Treatment Duration (Months)'] : '',
      item['Best Response (RECIST)'] || '',
      Number.isFinite(item['Response Duration (Months)']) ? item['Response Duration (Months)'] : '',
    ],
  ]);

  return [...acc, ...historyRows];
}, []);

module.exports.createWorksheet = (workbook, data) => {
  if (!data[0].TreatmentHistory) return;

  const sheet = workbook.addWorksheet('Patient Treatment History', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(3, 3, 3, 6).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(3, 6, 3, 14).style({
    ...alignmentStyle,
    ...greenHeaderStyle,
  });

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
