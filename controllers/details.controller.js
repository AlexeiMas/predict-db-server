const {
  PDCModel, ClinicalData, TreatmentHistory,
} = require('../models');
const {
  modelFields, clinicalDataFields, treatmentHistoryFields,
} = require('../models/fields');
const treatmentInfo = require('../data/treatmentInfo.json');
const genesNames = require('../data/genesNames.json');

const MAX_GENES_SEARCH_COUNT = process.env.MAX_GENES_SEARCH_COUNT || 20;
const LIMIT_EXCEEDED = 'Genes limit exceeded';
const NOT_FOUND = 'Not found';
const FILTER_NEEDED = 'Genes filter is needed';

const general = async (req, res) => {
  try {
    const { modelId } = req.params;

    const filter = { 'Model ID': modelId };
    const data = await PDCModel
      .findOne(filter)
      .select(modelFields)
      .populate(['TreatmentResponsesCount'])
      .lean();

    if (!data) return res.status(404).send(NOT_FOUND);

    const responsesCount = data.TreatmentResponsesCount > 0;
    const extended = { ...data, 'Has PredictRx Response Data': !!responsesCount };

    return res.json(extended);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const clinical = async (req, res) => {
  try {
    const { modelId } = req.params;

    const data = await ClinicalData
      .findOne({ 'PDC Model': modelId })
      .select(clinicalDataFields)
      .lean();

    return res.json(data);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const history = async (req, res) => {
  try {
    const { modelId } = req.params;
    const { limit, offset } = req.query;

    const clinicalData = await ClinicalData
      .findOne({ 'PDC Model': modelId })
      .select({ 'PDC Model': 1, 'Case ID': 1 })
      .lean();

    if (!clinicalData) return res.status(404).send(NOT_FOUND);

    const filter = { 'PredictRx Case ID': clinicalData['Case ID'] };
    const count = await TreatmentHistory
      .countDocuments(filter)
      .lean();
    const data = await TreatmentHistory
      .find(filter)
      .select(treatmentHistoryFields)
      .limit(limit)
      .skip(offset)
      .lean();

    return res.json({ count, rows: data });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const responses = async (req, res) => {
  try {
    const { modelId } = req.params;
    const { tumourType, tumourSubType } = req.query;

    const filter = {
      'PDC Model': modelId,
      ...(tumourType ? { 'Primary Tumour Type': { $in: tumourType } } : {}),
      ...(tumourSubType ? { 'Tumour Sub-type': { $in: tumourSubType } } : {}),
    };
    const data = tumourType || tumourSubType
      ? await ClinicalData
        .findOne(filter)
        .select({ 'PDC Model': 1, 'SNOMED ID': 1 })
        .populate({
          path: 'Model',
          select: { 'Model ID': 1 },
          populate: {
            path: 'TreatmentResponses',
            sort: { 'Response Percentile': -1 },
          },
        })
        .lean()
      : null;

    const snomedId = data ? data['SNOMED ID'] : null;
    const filtered = data && data.Model.TreatmentResponses
      ? data.Model.TreatmentResponses.reduce((acc, item) => {
        const exists = treatmentInfo.find((i) => i.Treatment === item.Treatment && i.Indications.includes(snomedId));

        return exists ? [...acc, item] : acc;
      }, [])
      : [];

    return res.json(filtered);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const ngs = async (req, res) => {
  try {
    const { modelId } = req.params;
    const {
      gene, alias, protein, includeExpressions,
    } = req.query;

    let genesSum = 0;

    if (gene) genesSum += gene.length;
    if (alias) genesSum += alias.length;
    if (protein) genesSum += protein.length;

    if (genesSum > MAX_GENES_SEARCH_COUNT) return res.status(400).send(LIMIT_EXCEEDED);

    if (!gene && !alias && !protein) return res.status(400).send(FILTER_NEEDED);

    const genesByAliasInfo = alias ? genesNames.filter((i) => {
      const intersection = i.aliases.filter((a) => alias.includes(a));
      return intersection.length > 0;
    }) : [];
    const genesByProteinInfo = protein ? genesNames.filter((i) => protein.includes(i.protein)) : [];
    const genesByAlias = genesByAliasInfo.length ? genesByAliasInfo.map((i) => i.gene) : [];
    const genesByProtein = genesByProteinInfo.length ? genesByProteinInfo.map((i) => i.gene) : [];

    const geneMutationsItems = [];
    const geneCopyNumbersItems = [];
    const geneExpressionsItems = [];
    const geneFusionsItems = [];

    if (gene) {
      geneMutationsItems.push({
        Gene_refGene: { $in: [...new Set(gene)] },
        cosmic68: { $nin: ['', '.', null, NaN] },
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
        cosmic68: { $nin: ['', '.', null, NaN] },
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
        cosmic68: { $nin: ['', '.', null, NaN] },
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

    const populations = [
      { path: 'MutationsGenes', match: geneMutationsFilter },
      { path: 'CopyNumbersGenes', match: geneCopyNumbersFilter },
      { path: 'FusionsGenes', match: geneFusionsFilter },
    ];

    if (includeExpressions) populations.push({ path: 'ExpressionsGenes', match: geneExpressionsFilter });

    const filter = { 'Model ID': modelId };
    const data = await PDCModel
      .findOne(filter)
      .select({ 'Model ID': 1 })
      .populate(populations)
      .lean();

    const mutationsGenes = data.MutationsGenes ? data.MutationsGenes.map((i) => i.Gene_refGene) : [];
    const copyNumbersGenes = data.CopyNumbersGenes ? data.CopyNumbersGenes.map((i) => i.Gene_name) : [];
    const expressionsGenes = data.ExpressionsGenes ? data.ExpressionsGenes.map((i) => i.Symbol) : [];
    const fusionsGenesFirstSymbols = data.FusionsGenes ? data.FusionsGenes
      .map((i) => i['Gene_1_symbol(5end_fusion_partner)']) : [];
    const fusionsGenesSecondSymbols = data.FusionsGenes ? data.FusionsGenes
      .map((i) => i['Gene_2_symbol(3end_fusion_partner)']) : [];
    const genes = [
      ...mutationsGenes,
      ...copyNumbersGenes,
      ...expressionsGenes,
      ...fusionsGenesFirstSymbols,
      ...fusionsGenesSecondSymbols,
    ];
    const uniqueGenes = [...new Set(genes)];
    const result = {
      genes: [],
      aliases: [],
      proteins: [],
    };

    if (gene) {
      result.genes = uniqueGenes.filter((g) => gene.includes(g));
    }

    if (alias) {
      result.aliases = genesNames
        .filter((i) => {
          const intersection = i.aliases.filter((a) => alias.includes(a));
          return intersection.length > 0 && uniqueGenes.includes(i.gene);
        })
        .reduce((collector, a) => {
          const filtered = a.aliases.find((i) => alias.includes(i));
          if (filtered) return [...collector, ...[filtered]];
          return collector;
        }, []);
    }

    if (protein) {
      result.proteins = genesNames
        .filter((i) => protein.includes(i.protein) && uniqueGenes.includes(i.gene))
        .map((i) => i.protein);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  general, clinical, history, responses, ngs,
};
