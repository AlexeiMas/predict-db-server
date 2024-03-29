const {
  sheetOptions, alignmentStyle, greyHeaderStyle, blueHeaderStyle,
  redBoldFontStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Treatment',
  'Response Percentile',
  'Phenotypic response to clinical drugs type',
];

const getResponseValues = (data) => data.reduce((acc, row) => {
  const responses = row.Model && row.Model.TreatmentResponses;

  if (!responses) return acc;

  const modelInfo = {
    modelId: row['PDC Model'] || '',
    tumourType: row['Primary Tumour Type'] || '',
    tumourSubType: row['Tumour Sub-type'] || '',
  };

  const responsesRows = responses.map((item) => {
    let percentile = '';

    if (item['Response Percentile'] !== null) {
      percentile = Number.isFinite(item['Response Percentile'])
        ? item['Response Percentile']
        : parseInt(item['Response Percentile']);
    }

    return {
      ...modelInfo,
      ...{
        treatment: item.Treatment || '',
        percentile,
        phenotypicType: item['Phenotypic Response Type'] || '',
      },
    };
  });

  return [...acc, ...responsesRows];
}, []);

const sortValues = (values) => values.sort((a, b) => {
  const percentileA = a.percentile;
  const percentileB = b.percentile;

  if (percentileA > percentileB) return -1;
  if (percentileA < percentileB) return 1;

  return 0;
});

const transformToArray = (values) => values.map((item) => [
  item.modelId,
  item.tumourType,
  item.tumourSubType,
  item.treatment,
  item.percentile,
  item.phenotypicType,
]);

const prepareValues = (data) => {
  const values = getResponseValues(data);
  const sorted = sortValues(values);

  return transformToArray(sorted);
};

module.exports.createWorksheet = (workbook, data = []) => {
  if (data.length === 0) return;
  const sheet = workbook.addWorksheet('PDC Model Treatment Responses', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(4, 1, 4, 4).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(4, 4, 4, 6).style({
    ...alignmentStyle,
    ...blueHeaderStyle,
  });

  sheet.cell(3, 4, 3, 10, true).string(
    '*Only treatments indicated for tumour type shown, contact us for full panel',
  ).style(redBoldFontStyle);

  sheet.column(6).setWidth(60);

  const values = prepareValues(data);
  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
