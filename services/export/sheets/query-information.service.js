const helpers = require('../helpers');

const FIELDS_EX = [ /* eslint-disable-line */
  'Enable RNA expression',
  'Genes',
  'Aliases',
  'Proteins',
  'Model ID',
  'Primary Tumour types',
  'Sub Tumour types',
  'Patient Treatment History(treatment)',
  'Patient Treatment History(response type)',
  'PDC Model Treatment Response (treatment)',
  'PDC Model Treatment Response (response type)',
];

const FIELDS_MAP = {
  includeExpressions: 'Enable RNA expression',
  gene: 'Genes',
  alias: 'Aliases',
  protein: 'Proteins',
  modelId: 'Model ID',
  tumourType: 'Primary Tumour types',
  tumourSubType: 'Sub Tumour types',
  historyTreatment: 'Patient Treatment History(treatment)',
  historyResponseType: 'Patient Treatment History(response type)',
  responsesTreatment: 'PDC Model Treatment Response (treatment)',
  responsesResponseType: 'PDC Model Treatment Response (response type)',
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
      (/true/gi.test(QueryInformation.includeExpressions) ? 'YES' : 'NO'),
      (gene[index] || 'NO'),
      (alias[index] || 'NO'),
      (protein[index] || 'NO'),
      (modelId[index] || 'NO'),
      (tumourType[index] || 'NO'),
      (tumourSubType[index] || 'NO'),
      (historyTreatment[index] || 'NO'),
      (historyResponseType[index] || 'NO'),
      (responsesTreatment[index] || 'NO'),
      (responsesResponseType[index] || 'NO'),
      (dataAvailable[index] || 'NO'),
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
  const sheet = workbook.addWorksheet('Query information', helpers.sheetOptions);

  helpers.setSheetBasicLayout(sheet);

  sheet.cell(3, 3, 3, 6).style({
    ...helpers.alignmentStyle,
    ...helpers.greyHeaderStyle,
  });

  sheet.cell(3, 6, 3, 17).style({
    ...helpers.alignmentStyle,
    ...helpers.blueHeaderStyle,
  });

  const values = prepareValues2({ QueryInformation });

  helpers.fillHeaderFields(sheet, FIELDS);
  helpers.fillValues(sheet, values);
};
