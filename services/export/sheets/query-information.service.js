const helpers = require('../helpers');

const FIELDS_EX = [ /* eslint-disable-line */
  'Enable RNA Expression',
  'Genes',
  'Aliases',
  'Proteins',
  'Model IDs',
  'Primary Tumour Types',
  'Tumour Sub Types',
  'Patient Treatment History (Treatment)',
  'Patient Treatment History (Response Type)',
  'PDC Model Treatment Response (Treatment)',
  'PDC Model Treatment Response (Response Type)',
];

const FIELDS_MAP = {
  includeExpressions: 'Enable RNA Expression',
  gene: 'Genes',
  alias: 'Aliases',
  protein: 'Proteins',
  modelId: 'Model IDs',
  tumourType: 'Primary Tumour Types',
  tumourSubType: 'Tumour Sub Types',
  historyTreatment: 'Patient Treatment History (Treatment)',
  historyResponseType: 'Patient Treatment History (Response Type)',
  responsesTreatment: 'PDC Model Treatment Response (Treatment)',
  responsesResponseType: 'PDC Model Treatment Response (Response Type)',
  dataAvailable: 'Data Available',
};

const FIELDS = Object.values(FIELDS_MAP);

const findMaxLengthValueLength = ({ QueryInformation }) => {
  const collected = Object.values(QueryInformation).filter((i) => Array.isArray(i)).map((i) => i.length);
  return Math.max(...collected);
};

const prepareValues = ({ QueryInformation }) => (i, index) => {
  const gene = QueryInformation.gene.sort((a, b) => a - b);
  const alias = QueryInformation.alias.sort((a, b) => a - b);
  const protein = QueryInformation.protein.sort((a, b) => a - b);
  const modelId = QueryInformation.modelId.sort((a, b) => a - b);
  const tumourType = QueryInformation.tumourType.sort((a, b) => a - b);
  const tumourSubType = QueryInformation.tumourSubType.sort((a, b) => a - b);
  const historyTreatment = QueryInformation.historyTreatment.sort((a, b) => a - b);
  const historyResponseType = QueryInformation.historyResponseType.sort((a, b) => a - b);
  const responsesTreatment = QueryInformation.responsesTreatment.sort((a, b) => a - b);
  const responsesResponseType = QueryInformation.responsesResponseType.sort((a, b) => a - b);
  const dataAvailable = QueryInformation.dataAvailable.sort((a, b) => a - b);
  if (index === 0) {
    return [
      (/true/gi.test(QueryInformation.includeExpressions) ? 'Yes' : 'None'),
      (gene[index] || 'None'),
      (alias[index] || 'None'),
      (protein[index] || 'None'),
      (modelId[index] || 'None'),
      (tumourType[index] || 'None'),
      (tumourSubType[index] || 'None'),
      (historyTreatment[index] || 'None'),
      (historyResponseType[index] || 'None'),
      (responsesTreatment[index] || 'None'),
      (responsesResponseType[index] || 'None'),
      (dataAvailable[index] || 'None'),
    ];
  }
  return [
    '',
    (gene[index] || ''),
    (alias[index] || ''),
    (protein[index] || ''),
    (modelId[index] || ''),
    (tumourType[index] || ''),
    (tumourSubType[index] || ''),
    (historyTreatment[index] || ''),
    (historyResponseType[index] || ''),
    (responsesTreatment[index] || ''),
    (responsesResponseType[index] || ''),
    (dataAvailable[index] || ''),
  ];
};

const prepareValues2 = ({ QueryInformation }) => {
  const max = findMaxLengthValueLength({ QueryInformation });
  const prepared = Object.keys(QueryInformation).reduce(
    (acc, key) => {
      if (/true|false/gi.test(QueryInformation[key])) {
        acc[key] = QueryInformation[key];
      } else {
        const sizeDiff = max - QueryInformation[key].length;
        acc[key] = [...QueryInformation[key], ...new Array(sizeDiff).fill('')];
      }
      return acc;
    },
    {},
  );

  const updated = new Array(max).fill(null).map(prepareValues({ QueryInformation: prepared }));
  return updated;
};

module.exports.createWorksheet = ({ workbook, QueryInformation }) => {
  const sheet = workbook.addWorksheet('Query Info', helpers.sheetOptions);

  helpers.setSheetQueryInfoLayout(sheet);

  sheet.cell(4, 1, 4, 12).style({
    ...helpers.alignmentStyle,
    ...helpers.queryInfoHeaderStyleFillGray25,
  });

  const values = prepareValues2({ QueryInformation });

  helpers.fillHeaderFields(sheet, FIELDS);
  helpers.fillValues(sheet, values);
};
