const {
  ClinicalData, Mutation, CopyNumber, Expression, Fusion, TreatmentHistory, TreatmentResponse, PDCModel,
} = require('../models');
const { clinicalDataFields } = require('../models/fields');
const exportService = require('../services/export');
const geneNames = require('../data/genesNames.json');
const treatmentInfo = require('../data/treatmentInfo.json');

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
    } = req.query;

    const modelIds = modelId ? [modelId] : [];
    const caseIds = [];
    const filteredModelIds = [];

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
      const uniqGene = [...new Set(gene)];

      geneMutationsItems.push({ Gene_refGene: { $in: uniqGene } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGene } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGene } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGene } },
        ],
      });

      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGene } });
    }

    if (genesByAlias.length) {
      const uniqGenesByAlias = [...new Set(genesByAlias)];
      geneMutationsItems.push({ Gene_refGene: { $in: uniqGenesByAlias } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGenesByAlias } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGenesByAlias } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGenesByAlias } },
        ],
      });

      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGenesByAlias } });
    }

    if (genesByProtein.length) {
      const uniqGenesByProtein = [...new Set(genesByProtein)];
      geneMutationsItems.push({ Gene_refGene: { $in: uniqGenesByProtein } });
      geneCopyNumbersItems.push({ Gene_name: { $in: uniqGenesByProtein } });
      geneFusionsItems.push({
        $or: [
          { 'Gene_1_symbol(5end_fusion_partner)': { $in: uniqGenesByProtein } },
          { 'Gene_2_symbol(3end_fusion_partner)': { $in: uniqGenesByProtein } },
        ],
      });

      if (includeExpressions) geneExpressionsItems.push({ Symbol: { $in: uniqGenesByProtein } });
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

    const isGeneFilter = Object.keys(geneMutationsFilter).length
      || Object.keys(geneCopyNumbersFilter).length
      || Object.keys(geneExpressionsFilter).length
      || Object.keys(geneFusionsFilter).length;
    const isTumourFilter = Object.keys(tumourFilter).length;
    const isResponsesFilter = Object.keys(responsesFilter).length;
    const isHistoryFilter = Object.keys(historyFilter).length;

    if (Object.keys(geneMutationsFilter).length) {
      const mutations = await Mutation.find(geneMutationsFilter).select({ 'Model ID': 1 });
      modelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneCopyNumbersFilter).length) {
      const copyNumbers = await CopyNumber.find(geneCopyNumbersFilter).select({ 'Model ID': 1 });
      modelIds.push(...new Set(copyNumbers.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneExpressionsFilter).length) {
      const expressions = await Expression.find(geneExpressionsFilter).select({ 'Model ID': 1 });
      modelIds.push(...new Set(expressions.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneFusionsFilter).length) {
      const fusions = await Fusion.find(geneFusionsFilter).select({ 'Model ID': 1 });
      modelIds.push(...new Set(fusions.map((item) => item['Model ID'])));
    }

    if (Object.keys(responsesFilter).length) {
      const responses = await TreatmentResponse.find(responsesFilter).select({ 'Model ID': 1 });
      modelIds.push(...new Set(responses.map((item) => item['Model ID'])));
    }

    if (Object.keys(historyFilter).length) {
      const history = await TreatmentHistory.find(historyFilter).select({ 'PredictRx Case ID': 1 });
      caseIds.push(...new Set(history.map((item) => item['PredictRx Case ID'])));
    }

    if (modelIds.length) {
      const models = await PDCModel.find({ 'Model ID': { $in: [...new Set(modelIds)] }, 'Visible Externally': true });
      const ids = models.map((i) => i['Model ID']);
      filteredModelIds.push(...ids);
    } else {
      const models = await PDCModel.find({ 'Visible Externally': true });
      const ids = models.map((i) => i['Model ID']);
      filteredModelIds.push(...ids);
    }

    const filter = {
      ...(isTumourFilter ? tumourFilter : {}),
      ...(modelId || isGeneFilter || isResponsesFilter ? { 'PDC Model': { $in: filteredModelIds } } : {}),
      ...(isHistoryFilter ? { 'Case ID': { $in: [...new Set(caseIds)] } } : {}),
      'PDC Model': { $in: filteredModelIds },
    };

    let ngsPopulations = [];

    if (gene || alias || protein) {
      ngsPopulations = [
        ...ngsPopulations,
        { path: 'Mutations', match: geneMutationsFilter },
        { path: 'Fusions', match: geneFusionsFilter },
        { path: 'CopyNumbers', match: geneCopyNumbersFilter },
      ];

      if (includeExpressions) ngsPopulations.push({ path: 'Expressions', match: geneExpressionsFilter });
    }

    const data = await ClinicalData
      .find(filter)
      .select(clinicalDataFields)
      .populate([
        {
          path: 'Model',
          populate: [
            {
              path: 'TreatmentResponses',
              ...(isResponsesFilter ? { match: responsesFilter } : {}),
            },
            {
              path: 'TreatmentResponsesCount',
              ...(isResponsesFilter ? { match: responsesFilter } : {}),
            },
            ...ngsPopulations,
          ],
        },
        {
          path: 'TreatmentHistory',
          ...(isHistoryFilter ? { match: historyFilter } : {}),
        },
      ])
      .lean();

    const extended = data.map((i) => {
      const hasResponseData = i.Model.TreatmentResponsesCount > 0;
      const responses = isTumourFilter && i.Model.TreatmentResponses
        ? i.Model.TreatmentResponses.reduce((acc, item) => {
          const exists = treatmentInfo
            .find((t) => t.Treatment === item.Treatment
              && t.Indications.includes(i['NIH MeSH Tree Number']));
          return exists ? [...acc, item] : acc;
        }, [])
        : [];
      i.Model.TreatmentResponses = responses; // eslint-disable-line

      return {
        ...i,
        'Has PredictRx Response Data': !!hasResponseData,
      };
    });

    return exportService.exportFile({ data: extended, response: res, includeExpressions });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
