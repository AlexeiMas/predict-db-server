const {
  ClinicalData, Expression, PDCModel,
} = require('../../models');

module.exports = async (req, res) => {
  try {
    const {
      geneSymbol1,
      geneSymbol2,
      categoricalValue,
    } = req.query;

    const geneExpressionsFilter = { Symbol: geneSymbol1 };
    const xData = await Expression.find(geneExpressionsFilter).select({ Symbol: 1, 'Log TPM': 1, 'Model ID': 1 });

    const geneMutationsFilter = { Symbol: geneSymbol2 };
    const yData = await Expression.find(geneMutationsFilter).select({ Symbol: 1, 'Log TPM': 1, 'Model ID': 1 });

    let catData = null;
    let catModelVar = 'Model ID';
    if (categoricalValue === 'NIH Primary Tumour Type' || categoricalValue === 'NIH Tumour Subtype') {
      catData = await PDCModel.find({ 'Visible Externally': true }).select({ 'Model ID': 1, 'NIH Primary Tumour Type': 1, 'NIH Tumour Subtype': 1 });
    } else {
      catModelVar = 'PDC Model';
      catData = await ClinicalData.find({}).select(
        { 'PDC Model': 1, Age: 1, Stage: 1, Ethnicity: 1, 'Smoking History': 1, Histology: 1, 'Receptor Status': 1, Sex: 1 },
      );
    }

    const combinedData = [];
    const filterCategories = ['unknown', 'n/a', 'pending', ''];
    for (let i = 0; i < xData.length; i++) {
      const modelID = xData[i]['Model ID'];
      const gene2 = yData.find((item) => (item['Model ID'] === modelID) && item);
      if (gene2) {
        const temp = {};
        temp.id = modelID;
        temp.x = xData[i]['Log TPM'];
        temp.y = gene2['Log TPM'];
        let cat = catData.find((item) => (item[catModelVar] === modelID) && item);
        cat = cat.toJSON();
        if (categoricalValue !== 'Age') {
          temp.cat = cat[categoricalValue] ? cat[categoricalValue].trim() : '';
        } else {
          temp.cat = 'Age_NA';
          if (cat.Age && cat.Age > 60) {
            temp.cat = 'Age_60+';
          } else if (cat.Age && cat.Age >= 30 && cat.Age <= 60) {
            temp.cat = 'Age_30-60';
          } else if (cat.Age && cat.Age < 30) {
            temp.cat = 'Age_Below30';
          }
        }
        if (!filterCategories.includes(temp.cat.toLowerCase())) {
          combinedData.push(temp);
        }
      }
    }
    const labels = {
      xLabel: `${geneSymbol1} RNA-seq`,
      yLabel: `${geneSymbol2} RNA-seq`,
      catLabel: 'Category',
    };

    return res.json({ data: combinedData, labels });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
