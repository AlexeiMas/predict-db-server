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
  '',

  // Mutations

  'gnomAD_genome_ALL',
  'Protein_position',
  'Amino_acids',
  'Func_refGene',
  'ExonicFunc_refGene',
  'Chr',
  'Start',
  'End',
  'Ref',
  'Alt',
  'Zygosity',
  'AF',
  'Quality',
  'CurrentExon',
  'EnsGenID',
  'EnsTransID',
  'cosmic68',
  'Existing_variation',

  // Copy Numbers

  'log2FC',
  'SV type',

  // Expressions

  'Relative Score (log TPM)',
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
      gene: item['Gene.refGene'] || '',
      variation: item.Existing_variation || '',
      proteinPosition: item.Protein_position || '',
      aminoAcids: item.Amino_acids || '',
      funcRefGene: item.Func_refGene || '',
      exonicFuncRefGene: item.ExonicFunc_refGene || '',
      chr: item.Chr || '',
      start: Number.isFinite(item.Start) ? item.Start : '',
      end: Number.isFinite(item.End) ? item.End : '',
      ref: item.Ref || '',
      alt: item.Alt || '',
      zygosity: item.Zygosity || '',
      af: item.AF || '',
      quality: Number.isFinite(item.Quality) ? item.Quality : '',
      currentExon: Number.isFinite(item.CurrentExon) ? item.CurrentExon : '',
      ensGenId: item.EnsGenID || '',
      ensTransId: item.EnsTransID || '',
      cosmic68: item.cosmic68 || '',
      gnomAd: item.gnomAD_genome_ALL || '',
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
  const mutationsRows = values.mutations.filter((i) => i.gene === gene);
  const copyNumbersRows = values.copyNumbers.filter((i) => i.geneName === gene);
  const expressionsRows = values.expressions.filter((i) => i.symbol === gene);
  const fusionsRows = values.fusions.filter((i) => i.gene1 === gene || i.gene2 === gene);

  const maxRowsCount = Math.max(
    mutationsRows.length,
    copyNumbersRows.length,
    expressionsRows.length,
    fusionsRows.length,
  );

  let modelIds;

  if (maxRowsCount === mutationsRows.length) modelIds = mutationsRows.map((i) => i.modelId);
  if (maxRowsCount === copyNumbersRows.length) modelIds = copyNumbersRows.map((i) => i.modelId);
  if (maxRowsCount === expressionsRows.length) modelIds = expressionsRows.map((i) => i.modelId);
  if (maxRowsCount === fusionsRows.length) modelIds = fusionsRows.map((i) => i.modelId);

  if (!modelIds) return collector;

  const modelRows = values.models.filter((i) => modelIds.includes(i.modelId));

  const collected = modelRows.map((item) => {
    const mutationsValues = mutationsRows.find((i) => i.modelId === item.modelId) || {
      gene,
      variation: '',
      proteinPosition: '',
      aminoAcids: '',
      funcRefGene: '',
      exonicFuncRefGene: '',
      chr: '',
      start: '',
      end: '',
      ref: '',
      alt: '',
      callerConfidence: '',
      zygosity: '',
      af: '',
      quality: '',
      currentExon: '',
      ensGenId: '',
      ensTransId: '',
      cosmic68: '',
      gnomAd: '',
    };
    const copyNumbersValues = copyNumbersRows.find((i) => i.modelId === item.modelId) || {
      log2FC: '',
      svType: '',
    };
    const expressionsValues = expressionsRows.find((i) => i.modelId === item.modelId) || {
      logTpm: '',
      percentile: '',
    };
    const fusionsValues = fusionsRows.find((i) => i.modelId === item.modelId) || {
      description: '',
      predictedEffect: '',
      fusionSequence: '',
      gene2: '',
      gene1: '',
    };

    return {
      ...item,
      ...mutationsValues,
      ...copyNumbersValues,
      ...expressionsValues,
      ...fusionsValues,
    };
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

const transformToArray = (values) => values.map((item) => [
  item.modelId,
  item.tumourType,
  item.tumourSubType,
  item.gene,
  '',
  item.gnomAd,
  item.proteinPosition,
  item.aminoAcids,
  item.funcRefGene,
  item.exonicFuncRefGene,
  item.chr,
  item.start,
  item.end,
  item.ref,
  item.alt,
  item.zygosity,
  item.af,
  item.quality,
  item.currentExon,
  item.ensGenId,
  item.ensTransId,
  item.cosmic68,
  item.variation,
  item.log2FC,
  item.svType,
  item.zscore,
  item.logTpm,
  item.percentile,
  item.gene1,
  item.gene2,
  item.description,
  item.predictedEffect,
  item.fusionSequence,
]);

const prepareValues = (data) => {
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
  const sorted = sortValues(aggregated);

  return transformToArray(sorted);
};

module.exports.createWorksheet = (workbook, data) => {
  if (!data[0].Model.Mutations
    && !data[0].Model.CopyNumbers
    && !data[0].Model.Expressions
    && !data[0].Model.Fusions) return;

  const sheet = workbook.addWorksheet('NGS (Aggregate)', sheetOptions);

  setSheetBasicLayout(sheet, true);

  sheet.cell(3, 3, 3, 5).style({
    ...alignmentStyle,
    ...greyHeaderStyle,
  });

  sheet.cell(3, 6, 3, 34).style({
    ...alignmentStyle,
    ...blueHeaderStyle,
  });

  sheet.cell(2, 8, 2, 24, false).style({
    ...alignmentStyle,
    ...mutationsFillStyle,
  });
  sheet.cell(2, 25, 2, 25, false).string('Mutations').style({
    ...alignmentStyle,
    ...mutationsFillStyle,
  });
  sheet.cell(2, 26, 2, 26, false).style({
    ...alignmentStyle,
    ...copyNumbersFillStyle,
  });
  sheet.cell(2, 27, 2, 27, false).string('Copy Numbers').style({
    ...alignmentStyle,
    ...copyNumbersFillStyle,
  });
  sheet.cell(2, 28, 2, 28, false).style({
    ...alignmentStyle,
    ...expressionsFillStyle,
  });
  sheet.cell(2, 29, 2, 29, false).string('Expressions').style({
    ...alignmentStyle,
    ...expressionsFillStyle,
  });
  sheet.cell(2, 30, 2, 33, false).style({
    ...alignmentStyle,
    ...fusionsFillStyle,
  });
  sheet.cell(2, 34, 2, 34, false).string('Fusions').style({
    ...alignmentStyle,
    ...fusionsFillStyle,
  });

  sheet.cell(1, 3)
    .string('**Results are aggregated across Mutations, Copy Number Variations, Expressions and Fusions, please expand relevant columns for more detail') // eslint-disable-line
    .style(redBoldFontStyle);
  sheet.cell(1, 28)
    .string('**Transcripts Per Million (log transformed), only protein coding genes shown')
    .style(redBoldFontStyle);
  sheet.cell(1, 29).string('***Rank of Model within gene distribution').style(redBoldFontStyle);

  setColumnGrouping(sheet, 1, 8, 25);
  setColumnGrouping(sheet, 2, 26, 27);
  setColumnGrouping(sheet, 3, 28, 29);
  setColumnGrouping(sheet, 4, 30, 34);

  const values = prepareValues(data);

  fillHeaderFields(sheet, FIELDS);
  fillValues(sheet, values, 3);
};
