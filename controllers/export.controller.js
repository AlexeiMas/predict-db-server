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

    const modelIds = [];
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

    if (modelId) modelIds.push(...modelId);

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
    const models = await PDCModel.find({ 'Visible Externally': true });
    const ids = models.map((i) => i['Model ID']);
    filteredModelIds.push(...ids);

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

      if (includeExpressions) {
        ngsPopulations.push({ path: 'Expressions', match: geneExpressionsFilter });
      }
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

    // console.log(data.length)
    // console.log(data[0])

    const extended = data.map((i) => {
      const hasResponseData = i.Model.TreatmentResponsesCount > 0;
      const responses = i.Model.TreatmentResponses
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

    // console.log('first extended var')
    // console.log(extended[0])

    return exportService.exportFile(extended, res);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
