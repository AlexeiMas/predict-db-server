const {
  ClinicalData, Mutation, TreatmentHistory, TreatmentResponse, CopyNumber, Expression, Fusion, PDCModel,
} = require('../models');
const { clinicalDataFields } = require('../models/fields');
const geneNames = require('../data/genesNames.json');

const MAX_GENES_SEARCH_COUNT = process.env.MAX_GENES_SEARCH_COUNT || 20;
const LIMIT_EXCEEDED = 'Genes limit exceeded';

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
      historyTreatment,
      historyResponseType,
      responsesTreatment,
      responsesResponseType,
      includeExpressions,
      limit,
      offset,
      sort,
      order,
    } = req.query;

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
      geneMutationsItems.push({
        Gene_refGene: { $in: [...new Set(gene)] },
      });
      geneCopyNumbersItems.push({ Gene_name: { $in: [...new Set(gene)] } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: [...new Set(gene)] } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: gene } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: gene } },
        ],
      });
    }
    if (genesByAlias.length) {
      geneMutationsItems.push({
        Gene_refGene: { $in: [...new Set(genesByAlias)] },
      });
      geneCopyNumbersItems.push({ Gene_name: { $in: [...new Set(genesByAlias)] } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: [...new Set(genesByAlias)] } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: genesByAlias } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: genesByAlias } },
        ],
      });
    }
    if (genesByProtein.length) {
      geneMutationsItems.push({
        Gene_refGene: { $in: [...new Set(genesByProtein)] },
      });
      geneCopyNumbersItems.push({ Gene_name: { $in: [...new Set(genesByProtein)] } });
      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: [...new Set(genesByProtein)] } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: genesByProtein } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: genesByProtein } },
        ],
      });
    }

    const geneMutationsFilter = geneMutationsItems.length ? { $or: geneMutationsItems } : {};
    const geneCopyNumbersFilter = geneCopyNumbersItems.length ? { $or: geneCopyNumbersItems } : {};
    const geneExpressionsFilter = geneExpressionsItems.length ? { $or: geneExpressionsItems } : {};
    const geneFusionsFilter = geneFusionsItems.length ? { $or: geneFusionsItems } : {};

    const tumourFilter = {
      ...(diagnosis ? { Diagnosis: { $in: diagnosis } } : {}),
      ...(tumourType ? { 'Primary Tumour Type': { $in: tumourType } } : {}),
      ...(tumourSubType ? { 'Tumour Sub-type': { $in: tumourSubType } } : {}),
    };

    const responsesFilter = {
      ...(responsesTreatment ? { Treatment: responsesTreatment } : {}),
      ...(responsesResponseType ? { 'Phenotypic Response Type': responsesResponseType } : {}),
    };

    const historyFilter = {
      ...(historyCollection ? { 'Pre/Post Collection': { $in: historyCollection } } : {}),
      ...(historyTreatment ? { Treatment: { $in: historyTreatment } } : {}),
      ...(historyResponseType ? { 'Best Response (RECIST)': { $in: historyResponseType } } : {}),
    };

    const models = await PDCModel.find({ 'Visible Externally': true });
    const ids = models.map((i) => i['Model ID']);
    modelIds.push(...ids);

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

    if (geneModelIds.length) {
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
      const filteredModels = await PDCModel.find({ 'Model ID': { $in: [...new Set(modelId)] }, 'Visible Externally': true }); // eslint-disable-line
      const filteredIds = filteredModels.map((i) => i['Model ID']);
      modelIds = modelIds.filter((a) => filteredIds.includes(a));
    }

    const filter = {
      ...(isTumourFilter ? tumourFilter : {}),
      ...(isHistoryFilter ? { 'Case ID': { $in: [...new Set(caseIds)] } } : {}),
      ...({ 'PDC Model': { $in: modelIds } }),
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

    return res.json({ count, rows: data });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
