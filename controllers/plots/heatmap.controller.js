const {
  Expression, PDCModel,
} = require('../../models');

module.exports = async (req, res) => {
  try {
    let {
      customGeneList,
    } = req.query;
    const { tumorType,
    } = req.query;
    let geneList = null;
    customGeneList = customGeneList.split(',');
    if (customGeneList.length > 0) {
      geneList = customGeneList;
    }

    const geneResults = [];
    const excludes = [];
    if (geneList) {
      for (let i = 0; i < geneList.length; i++) {
        const geneExpressionsFilter = { Symbol: geneList[i] };
        const geneData = Expression.find(geneExpressionsFilter).select({ Symbol: 1, 'Log TPM': 1, 'Model ID': 1 });
        if (geneData.length) {
          geneData.map((item) => geneResults.push(item));
        } else {
          excludes.push(geneList[i]);
        }
      }
    }
    const normTpm = {};
    const models = [];

    const tumorFilter = { 'NIH Tumour Subtype': tumorType, 'Visible Externally': true };
    const catData = await PDCModel.find(tumorFilter).select({ 'Model ID': 1, 'NIH Primary Tumour Type': 1, 'NIH Tumour Subtype': 1 });

    for (let i = 0; i < geneResults.length; i++) {
      const modelID = geneResults[i]['Model ID'];
      const symbol = geneResults[i].Symbol;
      const cat = catData.find((item) => (item['Model ID'] === modelID) && item);
      if (cat) {
        if (!models.includes(modelID)) {
          models.push(modelID);
        }

        if (!normTpm[symbol]) {
          normTpm[symbol] = [];
        }

        normTpm[symbol].push({
          'Model ID': modelID,
          'Log TPM': geneResults[i]['Log TPM'],
        });
      }
    }
    return res.json({ data: normTpm, models, excludes });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
