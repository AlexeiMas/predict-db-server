const {
  ClinicalData, Mutation, TreatmentHistory, TreatmentResponse, CopyNumber, Expression, Fusion, PDCModel,
} = require('../models');
const { clinicalDataFields } = require('../models/fields');
const geneNames = require('../data/genesNames.json');

const MAX_GENES_SEARCH_COUNT = process.env.MAX_GENES_SEARCH_COUNT || 20;
const LIMIT_EXCEEDED = 'Genes limit exceeded';

/*
  Tumours filter by @albert.bezman
  It should be an OR between each different option,
  regardless if it's primary or subtype,
  so in your example,
  when you selected the 'carcinoma lobular' it should have kept the 42 results,
  because it would be pulling in both breast and carcinoma lobular.

  The behaviour in the 3rd example is correct,
  so if you only selected the subtype it only shows the subtype results
*/

/*
  10. Add new filter to front end
  Filter name: 'Data available'
  Filter function:
  Filter models by the booleans setup for the icons (e.g. has ngs data, has patient treatment history, has plasma etc).
  User should be able to select multiple categories of 'data available' selectors from the following list:
  'NGS', 'Patient Treatment History', 'PDC Model Treatment Response', 'Growth Characteristics', 'Plasma', 'PBMC'.
  Each time a label is selected, only the models that have those booleans set to true should be returned.
  If multiple labels are selected, the operation should be an AND (e.g. model 'has ngs data' AND model 'has patient treatment history')
  I believe the logic for getting the booleans for the icons is inside clinicalData.model.js & PDCmodels.model.js
*/

const getPdcModelFiltersFromDataAvailable = (dataAvailable) => {
  const pdsModelFiltersMap = {
    NGS: 'Has NGS Data',
    'Patient Treatment History': 'Has Patient Treatment History',
    'Growth Characteristics': 'Has Growth Characteristics',
  };
  const filter = dataAvailable.reduce((acc, i) => {
    const collector = { ...acc };
    if (!pdsModelFiltersMap[i]) return collector;
    collector[pdsModelFiltersMap[i]] = true;
    return collector;
  }, {});
  return Object.keys(filter).length === 0 ? false : filter;
};

const getClinicalDataFiltersFromDataAvailable = (dataAvailable) => {
  const clinicalDataFiltersMap = { Plasma: 'Plasma', PBMC: 'PBMC' };
  const filter = dataAvailable.reduce((acc, i) => {
    const collector = { ...acc };
    if (!clinicalDataFiltersMap[i]) return collector;
    collector[clinicalDataFiltersMap[i]] = true;
    return collector;
  }, {});

  return Object.keys(filter).length === 0 ? false : filter;
};

module.exports = async (req, res) => {
  try {
    const {
      gene,
      alias,
      protein,
      modelId,
      diagnosis,
      tumourType,
      tumourSubType,
      historyCollection,
      historyResponseType,
      responsesTreatment,
      responsesResponseType,
      includeExpressions,
      limit,
      offset,
      sort,
      order,
    } = req.query;

    let historyTreatment = (req.query.historyTreatment || []).slice();
    const dataAvailable = (req.query.dataAvailable || []).slice();
    const clinicalDataDataAvailableFilter = getClinicalDataFiltersFromDataAvailable(dataAvailable);
    const pdcModelFilter = getPdcModelFiltersFromDataAvailable(dataAvailable);

    let genesSum = 0;

    if (gene) genesSum += gene.length;
    if (alias) genesSum += alias.length;
    if (protein) genesSum += protein.length;

    if (genesSum > MAX_GENES_SEARCH_COUNT) return res.status(400).send(LIMIT_EXCEEDED);

    let modelIds = [];
    const geneModelIds = [];
    const caseIds = [];

    const genesByAliasInfo = alias ? geneNames.filter((i) => {
      const intersection = i.aliases.filter((a) => alias.includes(a));
      return intersection.length > 0;
    }) : [];
    const genesByProteinInfo = protein ? geneNames.filter((i) => protein.includes(i.protein)) : [];
    const genesByAlias = genesByAliasInfo.length ? genesByAliasInfo.map((i) => i.gene) : [];
    const genesByProtein = genesByProteinInfo.length ? genesByProteinInfo.map((i) => i.gene) : [];

    const geneMutationsItems = [];
    const geneCopyNumbersItems = [];
    const geneExpressionsItems = [];
    const geneFusionsItems = [];

    if (gene) {
      const uniqGenes = [...new Set(gene)];
      geneMutationsItems.push({ Gene_refGene: { $in: uniqGenes } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGenes } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGenes } });
      geneFusionsItems.push({ 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGenes } });
      geneFusionsItems.push({ 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGenes } });
    }
    if (genesByAlias.length) {
      const uniqGenesByAlias = [...new Set(genesByAlias)];
      geneMutationsItems.push({ Gene_refGene: { $in: uniqGenesByAlias } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGenesByAlias } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGenesByAlias } });
      geneFusionsItems.push({ 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGenesByAlias } });
      geneFusionsItems.push({ 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGenesByAlias } });
    }
    if (genesByProtein.length) {
      const uniqGenesByProtein = [...new Set(genesByProtein)];
      geneMutationsItems.push({ Gene_refGene: { $in: uniqGenesByProtein } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGenesByProtein } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGenesByProtein } });
      geneFusionsItems.push({ 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGenesByProtein } });
      geneFusionsItems.push({ 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGenesByProtein } });
    }

    const geneMutationsFilter = geneMutationsItems.length ? { $or: geneMutationsItems } : {};
    const geneCopyNumbersFilter = geneCopyNumbersItems.length ? { $or: geneCopyNumbersItems } : {};
    const geneExpressionsFilter = geneExpressionsItems.length ? { $or: geneExpressionsItems } : {};
    const geneFusionsFilter = geneFusionsItems.length ? { $or: geneFusionsItems } : {};

    const tumourFilter = {
      ...(diagnosis ? { Diagnosis: { $in: diagnosis } } : {}),
    };

    if (tumourType.length !== 0 && tumourSubType.length !== 0) {
      const include = {
        $or: [
          ...(tumourType.length === 0 ? [] : [{ 'Primary Tumour Type': { $in: tumourType } }]),
          ...(tumourSubType.length === 0 ? [] : [{ 'Tumour Sub-type': { $in: tumourSubType } }]),
        ],
      };
      Object.assign(tumourFilter, include);
    }

    if (tumourType.length !== 0 && tumourSubType.length === 0) {
      const include = { 'Primary Tumour Type': { $in: tumourType } };
      Object.assign(tumourFilter, include);
    }

    if (tumourType.length === 0 && tumourSubType.length !== 0) {
      const include = { 'Tumour Sub-type': { $in: tumourSubType } };
      Object.assign(tumourFilter, include);
    }

    const responsesFilter = {
      ...(responsesTreatment ? { Treatment: responsesTreatment } : {}),
      ...(responsesResponseType ? { 'Phenotypic Response Type': responsesResponseType } : {}),
    };

    if (historyTreatment && historyTreatment.length) {
      const lower = (s = '') => s.trim().toLowerCase();
      const comparators = historyTreatment.map(lower).filter(Boolean);
      const found = await TreatmentHistory.find({}).lean();
      found.forEach((i) => {
        const treatment = lower(i.Treatment);
        const contains = comparators.some((c) => treatment.includes(c));
        if (contains) historyTreatment.push(i.Treatment);
      });
      historyTreatment = [...new Set(historyTreatment)];
    }

    const historyFilter = {
      ...(historyCollection ? { 'Pre/Post Collection': { $in: historyCollection } } : {}),
      ...(historyTreatment ? { Treatment: { $in: historyTreatment } } : {}),
      ...(historyResponseType ? { 'Best Response (RECIST)': { $in: historyResponseType } } : {}),
    };

    const models = await PDCModel.find(
      { 'Visible Externally': true, ...(pdcModelFilter || {}) },
    );
    const ids = models.map((i) => i['Model ID']);
    modelIds.push(...ids);

    const isGeneFilter = Object.keys(geneMutationsFilter).length
      || Object.keys(geneCopyNumbersFilter).length
      || Object.keys(geneExpressionsFilter).length
      || Object.keys(geneFusionsFilter).length;
    const isTumourFilter = Object.keys(tumourFilter).length;
    const isHistoryFilter = Object.keys(historyFilter).length;

    if (Object.keys(geneMutationsFilter).length) {
      const mutations = await Mutation.find(geneMutationsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneCopyNumbersFilter).length) {
      const mutations = await CopyNumber.find(geneCopyNumbersFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneExpressionsFilter).length) {
      const mutations = await Expression.find(geneExpressionsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneFusionsFilter).length) {
      const mutations = await Fusion.find(geneFusionsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (isGeneFilter) {
      modelIds = modelIds.filter((a) => geneModelIds.includes(a));
    }

    if (Object.keys(responsesFilter).length) {
      const responses = await TreatmentResponse.find(responsesFilter).select({ 'Model ID': 1 });
      const rids = [...new Set(responses.map((item) => item['Model ID']))];
      modelIds = modelIds.filter((a) => rids.includes(a));
    }

    if (Object.keys(historyFilter).length) {
      const history = await TreatmentHistory.find(historyFilter).select({ 'PredictRx Case ID': 1 });
      caseIds.push(...new Set(history.map((item) => item['PredictRx Case ID'])));
    }

    if (modelId) {
      const filteredModels = await PDCModel.find({
        'Model ID': {
          $in: [...new Set(modelId)],
        },
        'Visible Externally': true,
      }); // eslint-disable-line
      const filteredIds = filteredModels.map((i) => i['Model ID']);
      modelIds = modelIds.filter((a) => filteredIds.includes(a));
    }

    const filter = {
      ...(isTumourFilter ? tumourFilter : {}),
      ...(isHistoryFilter ? { 'Case ID': { $in: [...new Set(caseIds)] } } : {}),
      ...({ 'PDC Model': { $in: modelIds } }),
      ...(clinicalDataDataAvailableFilter || {}),
    };

    const sorting = { [sort]: order };

    const count = await ClinicalData
      .countDocuments(filter)
      .lean();

    const data = await ClinicalData
      .find(filter)
      .select(clinicalDataFields)
      .populate({ path: 'Model', populate: 'TreatmentResponsesCount' })
      .limit(limit)
      .skip(offset)
      .sort(sorting)
      .lean();

    const filterByTreatmentResponsesCount = dataAvailable.some((i) => /PDC Model Treatment Response/gi.test(i));

    if (filterByTreatmentResponsesCount) {
      const clone = (some) => JSON.parse(JSON.stringify(some));
      const fdata = await ClinicalData
        .find(filter)
        .select(clinicalDataFields)
        .populate({ path: 'Model', populate: 'TreatmentResponsesCount' })
        .sort(sorting)
        .lean();
      const filtered = clone(fdata).reduce(
        (acc, item) => {
          const hasResponseData = item.Model.TreatmentResponsesCount > 0;
          return hasResponseData ? [...acc, item] : acc;
        },
        [],
      );
      const end = (+offset) + (+limit);
      const toResponse = filtered.slice(offset, end);
      return res.json({ count: filtered.length, rows: toResponse });
    }

    return res.json({ count, rows: data });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
