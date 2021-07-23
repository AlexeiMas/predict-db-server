const {
  sheetOptions, alignmentStyle, greenHeaderStyle, greyHeaderStyle, setSheetBasicLayout, fillHeaderFields, fillValues,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Confirmed Protein Expression',
  'Microsatelite Status',
  'Tumour Mutation Burden Status',
  'HLA Typing A',
  'HLA Typing B',
  'HLA Typing C',
];

const prepareValues = (data) => data.map((row) => {
  const model = row.Model;

  const allelesA = model
    && model.hla
    && model.hla.alleles
    ? model.hla.alleles.filter((i) => i.includes('A')) : [];
  const allelesB = model
    && model.hla
    && model.hla.alleles
    ? model.hla.alleles.filter((i) => i.includes('B')) : [];
  const allelesC = model
    && model.hla
    && model.hla.alleles
    ? model.hla.alleles.filter((i) => i.includes('C')) : [];

  return [
    row['PDC Model'] || '',
    row['Primary Tumour Type'] || '',
    row['Tumour Sub-type'] || '',
    model && model['Confirmed Protein Expression'] ? model['Confirmed Protein Expression'] : '',
    model && model['Microsatelite Status'] ? model['Microsatelite Status'] : '',
    model && model['Tumour Mutation Burden Status'] ? model['Tumour Mutation Burden Status'] : '',
    allelesA.length ? allelesA.join(', ') : '',
    allelesB.length ? allelesB.join(', ') : '',
    allelesC.length ? allelesC.join(', ') : '',
  ];
});

module.exports.createWorksheet = (workbook, data) => {
  const sheet = workbook.addWorksheet('IO Phenotypes', sheetOptions);

  setSheetBasicLayout(sheet);

  sheet.cell(3, 3, 3, 6).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(3, 6, 3, 11).style({
    ...alignmentStyle,
    ...greenHeaderStyle,
  });

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values);
};
