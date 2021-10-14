const {
  ClinicalData, Mutation, CopyNumber, Expression, Fusion, TreatmentHistory, TreatmentResponse, PDCModel,
} = require('../models');
const { clinicalDataFields } = require('../models/fields');
const exportService = require('../services/export');
const geneNames = require('../data/genesNames.json');
const treatmentInfo = require('../data/treatmentInfo.json');

const clone = (some) => JSON.parse(JSON.stringify(some));
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
    const { includeExpressions, diagnosis } = clone(req.query);

    const prepareToUniqArray = (value) => {
      if (typeof value === 'string' && !!value.trim() === false) return [];
      const re = /(undefined|null)/gi;
      const clearUndefinedNull = (i) => re.test(i) === false;
      const successValue = [...new Set([value].flat(Infinity).filter(clearUndefinedNull))];
      return successValue;
    };

    const gene = prepareToUniqArray(req.query.gene);
    const alias = prepareToUniqArray(req.query.alias);
    const protein = prepareToUniqArray(req.query.protein);
    const modelId = prepareToUniqArray(req.query.modelId);
    const tumourType = prepareToUniqArray(req.query.tumourType);
    const tumourSubType = prepareToUniqArray(req.query.tumourSubType);
    const historyCollection = prepareToUniqArray(req.query.historyCollection);
    const historyTreatment = prepareToUniqArray(req.query.historyTreatment);
    const historyResponseType = prepareToUniqArray(req.query.historyResponseType);
    const responsesTreatment = prepareToUniqArray(req.query.responsesTreatment);
    const responsesResponseType = prepareToUniqArray(req.query.responsesResponseType);
    const dataAvailable = prepareToUniqArray(req.query.dataAvailable);
    const clinicalDataDataAvailableFilter = getClinicalDataFiltersFromDataAvailable(dataAvailable);
    const pdcModelFilter = getPdcModelFiltersFromDataAvailable(dataAvailable);

    let modelIds = modelId ? [...modelId] : [];
    const geneModelIds = [];
    const caseIds = [];

    const genesByAliasInfo = alias.length > 0 ? geneNames.filter((i) => {
      const intersection = i.aliases.filter((a) => alias.includes(a));
      return intersection.length > 0;
    }) : [];
    const genesByProteinInfo = protein.length > 0 ? geneNames.filter((i) => protein.includes(i.protein)) : [];
    const genesByAlias = genesByAliasInfo.length ? genesByAliasInfo.map((i) => i.gene) : [];
    const genesByProtein = genesByProteinInfo.length ? genesByProteinInfo.map((i) => i.gene) : [];

    const geneMutationsItems = [];
    const geneCopyNumbersItems = [];
    const geneExpressionsItems = [];
    const geneFusionsItems = [];

    if (gene.length > 0) {
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
      ...(responsesTreatment.length > 0 ? { Treatment: responsesTreatment } : {}),
      ...(responsesResponseType.length > 0 ? { 'Phenotypic Response Type': responsesResponseType } : {}),
    };

    const historyFilter = {
      ...(historyCollection.length > 0 ? { 'Pre/Post Collection': { $in: historyCollection } } : {}),
      ...(historyTreatment.length > 0 ? { Treatment: { $in: historyTreatment } } : {}),
      ...(historyResponseType.length > 0 ? { 'Best Response (RECIST)': { $in: historyResponseType } } : {}),
    };

    const models = await PDCModel.find({ 'Visible Externally': true, ...(pdcModelFilter || {}) });
    const ids = models.map((i) => i['Model ID']);
    modelIds.push(...ids);

    // const isGeneFilter = Object.keys(geneMutationsFilter).length
    //   || Object.keys(geneCopyNumbersFilter).length
    //   || Object.keys(geneExpressionsFilter).length
    //   || Object.keys(geneFusionsFilter).length;
    const isTumourFilter = Object.keys(tumourFilter).length;
    const isResponsesFilter = Object.keys(responsesFilter).length;
    const isHistoryFilter = Object.keys(historyFilter).length;

    if (Object.keys(geneMutationsFilter).length) {
      const mutations = await Mutation.find(geneMutationsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(mutations.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneCopyNumbersFilter).length) {
      const copyNumbers = await CopyNumber.find(geneCopyNumbersFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(copyNumbers.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneExpressionsFilter).length) {
      const expressions = await Expression.find(geneExpressionsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(expressions.map((item) => item['Model ID'])));
    }

    if (Object.keys(geneFusionsFilter).length) {
      const fusions = await Fusion.find(geneFusionsFilter).select({ 'Model ID': 1 });
      geneModelIds.push(...new Set(fusions.map((item) => item['Model ID'])));
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

    if (modelId.length) {
      const filteredModels = await PDCModel.find({ 'Model ID': { $in: [...new Set(modelId)] }, 'Visible Externally': true }); // eslint-disable-line
      const filteredIds = filteredModels.map((i) => i['Model ID']);
      modelIds = modelIds.filter((a) => filteredIds.includes(a));
    }

    const filter = {
      ...(isTumourFilter ? tumourFilter : {}),
      ...(isHistoryFilter ? { 'Case ID': { $in: [...new Set(caseIds)] } } : {}),
      ...({ 'PDC Model': { $in: modelIds } }),
      ...(clinicalDataDataAvailableFilter || {}),
    };

    let ngsPopulations = [];

    if (gene.length > 0 || alias.length > 0 || protein.length > 0) {
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

    return exportService.exportFile({
      data: extended,
      response: res,
      includeExpressions,
      QueryInformation: clone(req.query),
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
