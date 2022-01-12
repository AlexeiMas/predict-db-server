const {
  sheetOptions, alignmentStyle, greyHeaderStyle, blueHeaderStyle, redBoldFontStyle,
  mutationsFillStyle, copyNumbersFillStyle, expressionsFillStyle, fusionsFillStyle,
  setSheetBasicLayout, fillHeaderFields, fillValues, setColumnGrouping,
} = require('../helpers');

const FIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Gene',

  // Mutations

  'AAChange',
  'Amino_acids',
  'EXON',
  'EnsGenID',
  'Feature',
  'CLIN_SIG',
  'VARIANT_CLASS',
  'GenomicPosition',
  'Consequence',
  'IMPACT',
  'BIOTYPE',
  'Codons',
  'Depth',
  'Population_Max',
  'AlleleFrequency',
  'Existing_variation',

  // Copy Numbers

  'log2FC',
  'SV type',

  // Fusions

  'Fusion_description',
  'Predicted_effect',
  'Fusion_sequence',
  'Gene_3end',
  'Gene_5end',
];

const RNAFIELDS = [
  'Model ID',
  'Primary Tumour Type',
  'Tumour Sub-type',
  'Gene',

  // Mutations

  'AAChange',
  'Amino_acids',
  'EXON',
  'EnsGenID',
  'Feature',
  'CLIN_SIG',
  'VARIANT_CLASS',
  'GenomicPosition',
  'Consequence',
  'IMPACT',
  'BIOTYPE',
  'Codons',
  'Depth',
  'Population_Max',
  'AlleleFrequency',
  'Existing_variation',

  // Copy Numbers

  'log2FC',
  'SV type',

  // Expressions

  'Relative Score (log TPM)',
  'Zscore',
  'Percentile',

  // Fusions

  'Fusion_description',
  'Predicted_effect',
  'Fusion_sequence',
  'Gene_3end',
  'Gene_5end',
];

const getNgsValues = (data) => data.reduce((acc, row) => {
  const copyNumbers = row.Model && row.Model.CopyNumbers;
  const expressions = row.Model && row.Model.Expressions;
  const fusions = row.Model && row.Model.Fusions;
  const mutations = row.Model && row.Model.Mutations;

  const modelInfo = {
    modelId: row['PDC Model'] || '',
    tumourType: row['Primary Tumour Type'] || '',
    tumourSubType: row['Tumour Sub-type'] || '',
  };

  const mutationsRows = mutations && mutations.length > 0
    ? mutations.map((item) => ({
      gene: item.SYMBOL || '',
      aachange: item.AAChange || '',
      amino_acids: item.Amino_acids || '',
      exon: item.EXON || '',
      ensgenid: item.EnsGenID || '',
      feature: item.Feature || '',
      clin_sig: item.CLIN_SIG || '',
      variant_class: item.VARIANT_CLASS || '',
      genomicposition: item.GenomicPosition || '',
      consequence: item.Consequence || '',
      impact: item.IMPACT || '',
      biotype: item.BIOTYPE || '',
      codons: item.Codons || '',
      depth: Number.isFinite(item.Depth) ? item.Depth : '',
      population_Max: Number.isFinite(item.Population_Max) ? item.Population_Max : '',
      allelefrequency: Number.isFinite(item.AlleleFrequency) ? item.AlleleFrequency : '',
      variation: item.Existing_variation || '',
      modelId: item['Model ID'],
    }))
    : [];

  const copyNumbersRows = copyNumbers && copyNumbers.length > 0
    ? copyNumbers.map((item) => ({
      geneName: item.Gene_name || '',
      log2FC: item.log2FC || '',
      svType: item['SV type'] || '',
      modelId: item['Model ID'],
    }))
    : [];

  const expressionsRows = expressions && expressions.length > 0
    ? expressions.map((item) => ({
      symbol: item.Symbol || '',
      logTpm: Number.isFinite(item['Log TPM']) ? item['Log TPM'] : '',
      zscore: Number.isFinite(item.Zscore) ? item.Zscore : '',
      percentile: Number.isFinite(item.Percentile) ? item.Percentile : '',
      modelId: item['Model ID'],
    }))
    : [];

  const fusionsRows = fusions && fusions.length > 0
    ? fusions.map((item) => ({
      description: item.Fusion_description || '',
      predictedEffect: item.Predicted_effect || '',
      fusionSequence: item.Fusion_sequence || '',
      gene2: item['Gene_2_symbol(3end_fusion_partner)'] || '',
      gene1: item['Gene_1_symbol(5end_fusion_partner)'] || '',
      modelId: item['Model ID'],
    }))
    : [];

  acc.models = [...acc.models, modelInfo];
  acc.mutations = [...acc.mutations, ...mutationsRows];
  acc.copyNumbers = [...acc.copyNumbers, ...copyNumbersRows];
  acc.expressions = [...acc.expressions, ...expressionsRows];
  acc.fusions = [...acc.fusions, ...fusionsRows];

  return acc;
}, {
  models: [],
  mutations: [],
  copyNumbers: [],
  expressions: [],
  fusions: [],
});

const aggregateValues = (genes, values) => genes.reduce((collector, gene) => {
  const mutationsRows = values.mutations.filter((i) => i.gene === gene)
    .map((e) => ({ ...e, consumed: false }));
  const copyNumbersRows = values.copyNumbers.filter((i) => i.geneName === gene)
    .map((e) => ({ ...e, consumed: false }));
  const expressionsRows = values.expressions.filter((i) => i.symbol === gene)
    .map((e) => ({ ...e, consumed: false }));
  const fusionsRows = values.fusions.filter((i) => i.gene1 === gene || i.gene2 === gene)
    .map((e) => ({ ...e, consumed: false }));

  const modelIds = [];

  modelIds.push(...mutationsRows.map((i) => i.modelId));
  modelIds.push(...copyNumbersRows.map((i) => i.modelId));
  modelIds.push(...expressionsRows.map((i) => i.modelId));
  modelIds.push(...fusionsRows.map((i) => i.modelId));

  if (!modelIds) return collector;

  const modelRows = modelIds;

  let collected = modelRows.map((item) => {
    const mutationsValues = mutationsRows.find((i, index) => {
      if (!i.consumed && i.modelId === item) {
        mutationsRows[index].consumed = true;
        return i.modelId === item;
      } return null;
    }) || {
      gene,
      aachange: '',
      amino_acids: '',
      exon: '',
      ensgenid: '',
      feature: '',
      clin_sig: '',
      variant_class: '',
      genomicposition: '',
      consequence: '',
      impact: '',
      biotype: '',
      codons: '',
      depth: '',
      population_Max: '',
      allelefrequency: '',
      variation: '',
    };
    const copyNumbersValues = copyNumbersRows.find((i, index) => {
      if (!i.consumed && i.modelId === item) {
        copyNumbersRows[index].consumed = true;
        return i.modelId === item;
      } return null;
    }) || {
      log2FC: '',
      svType: '',
    };
    const expressionsValues = expressionsRows.find((i, index) => {
      if (!i.consumed && i.modelId === item) {
        expressionsRows[index].consumed = true;
        return i.modelId === item;
      } return null;
    }) || {
      logTpm: '',
      zscore: '',
      percentile: '',
    };
    const fusionsValues = fusionsRows.find((i, index) => {
      if (!i.consumed && i.modelId === item) {
        fusionsRows[index].consumed = true;
        return i.modelId === item;
      } return null;
    }) || {
      description: '',
      predictedEffect: '',
      fusionSequence: '',
      gene2: '',
      gene1: '',
    };

    return {
      ...values.models.find((i) => i.modelId === item),
      ...mutationsValues,
      ...copyNumbersValues,
      ...expressionsValues,
      ...fusionsValues,
    };
  });

  collected = collected.filter((e) => {
    const y = { ...e };
    y.modelId = '';
    y.tumourType = '';
    y.tumourSubType = '';
    y.gene = '';
    y.consumed = '';
    return !Object.values(y).every((i) => i === '');
  });

  return [...collector, ...collected];
}, []);

const sortValues = (values) => values.sort((a, b) => {
  const geneA = a.gene.toUpperCase();
  const geneB = b.gene.toUpperCase();

  if (geneA > geneB) return 1;
  if (geneA < geneB) return -1;
  return 0;
});

const sortValuesRNA = (values) => values.sort((a, b) => {
  const percA = a.percentile;
  const percB = b.percentile;

  if (percA < percB) return 1;
  if (percA > percB) return -1;
  return 0;
});

const transformToArray = ({ sorted, includeExpressions }) => sorted.map((item) => [
  item.modelId,
  item.tumourType,
  item.tumourSubType,
  item.gene,
  item.aachange,
  item.amino_acids,
  item.exon,
  item.ensgenid,
  item.feature,
  item.clin_sig,
  item.variant_class,
  item.genomicposition,
  item.consequence,
  item.impact,
  item.biotype,
  item.codons,
  item.depth,
  item.population_Max,
  item.allelefrequency,
  item.variation,
  item.log2FC,
  item.svType,
  ...(includeExpressions ? [item.logTpm] : []),
  ...(includeExpressions ? [item.zscore] : []),
  ...(includeExpressions ? [item.percentile] : []),
  item.description,
  item.predictedEffect,
  item.fusionSequence,
  item.gene2,
  item.gene1,
]);

const prepareValues = ({ data, includeExpressions }) => {
  const ngsValues = getNgsValues(data);

  const maxCount = Math.max(
    ngsValues.mutations.length,
    ngsValues.copyNumbers.length,
    ngsValues.expressions.length,
    ngsValues.fusions.length,
  );

  let genes = [];

  if (maxCount === ngsValues.mutations.length) genes = ngsValues.mutations.map((i) => i.gene);
  if (maxCount === ngsValues.copyNumbers.length) genes = ngsValues.copyNumbers.map((i) => i.geneName);
  if (maxCount === ngsValues.expressions.length) genes = ngsValues.expressions.map((i) => i.symbol);
  if (maxCount === ngsValues.fusions.length) genes = ngsValues.fusions.map((i) => i.gene1 || i.gene2);

  const uniqueGenes = [...new Set(genes)];

  const aggregated = aggregateValues(uniqueGenes, ngsValues);
  const sorted = includeExpressions ? sortValuesRNA(aggregated) : sortValues(aggregated);

  return transformToArray({ sorted, includeExpressions });
};

const isSuccessDataToCreateWorksheet = ({ data, includeExpressions }) => {
  if (!data) return false;
  const [head] = data;
  if (!head || !head.Model) return false;

  const required = includeExpressions ? ['Mutations', 'CopyNumbers', 'Expressions', 'Fusions'] : ['Mutations', 'CopyNumbers', 'Fusions']; // eslint-disable-line
  const headModelLoweredKeys = Object.keys(head.Model).map((key) => key.toLowerCase());
  return required.every((i) => headModelLoweredKeys.includes(i.toLowerCase()));
};

module.exports.createWorksheet = ({ workbook, data, includeExpressions }) => {
  const align = { ...alignmentStyle };
  if (isSuccessDataToCreateWorksheet({ data, includeExpressions })) {
    const sheet = workbook.addWorksheet('NGS (Aggregate)', sheetOptions);

    setSheetBasicLayout(sheet, true);

    // ws.cell(startRow, startColumn, [[endRow, endColumn], isMerged]);
    sheet.cell(4, 1, 4, 3).style({ ...align, ...greyHeaderStyle });
    sheet.cell(3, 5, 3, 19, false).style({ ...align, ...mutationsFillStyle });
    sheet.cell(3, 20, 3, 20, false).string('Mutations').style({ ...align, ...mutationsFillStyle });
    sheet.cell(3, 21, 3, 21, false).style({ ...align, ...copyNumbersFillStyle });
    sheet.cell(3, 22, 3, 22, false).string('Copy Numbers').style({ ...align, ...copyNumbersFillStyle });

    sheet.cell(1, 2)
      // eslint-disable-next-line
      .string('**Results are aggregated across Mutations, Copy Number Variations, Expressions and Fusions, please expand relevant columns for more detail')
      .style(redBoldFontStyle);

    setColumnGrouping(sheet, 1, 5, 20);
    setColumnGrouping(sheet, 2, 21, 22);

    if (includeExpressions === true) {
      /* include Expressions   */
      sheet.cell(4, 3, 4, 30).style({ ...align, ...blueHeaderStyle });
      sheet.cell(3, 25, 3, 25, false).string('Expressions').style({ ...align, ...expressionsFillStyle });
      sheet.cell(3, 23, 3, 24, false).style({ ...align, ...expressionsFillStyle });
      sheet.cell(2, 23)
        .string('**Transcripts Per Million (log transformed)')
        .style(redBoldFontStyle);
      sheet.cell(2, 25).string('***Rank of Model within gene distribution, only protein coding genes shown').style(redBoldFontStyle); // eslint-disable-line
      sheet.cell(3, 26, 3, 29, false).style({ ...align, ...fusionsFillStyle });
      sheet.cell(3, 30, 3, 30, false).string('Fusions').style({ ...align, ...fusionsFillStyle });
      setColumnGrouping(sheet, 3, 23, 25);
      setColumnGrouping(sheet, 4, 26, 30);
    } else {
      /* exclude Expressions   */
      setColumnGrouping(sheet, 4, 23, 27);
      sheet.cell(4, 4, 4, 27).style({ ...align, ...blueHeaderStyle });
      sheet.cell(3, 23, 3, 26, false).style({ ...align, ...fusionsFillStyle });
      sheet.cell(3, 27, 3, 27, false).string('Fusions').style({ ...align, ...fusionsFillStyle });
    }

    const values = prepareValues({ data, includeExpressions });

    fillHeaderFields(sheet, includeExpressions ? RNAFIELDS : FIELDS);
    fillValues(sheet, values, 1);
  }
};
