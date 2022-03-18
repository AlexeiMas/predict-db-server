const {
  ClinicalData, Expression, PDCModel,
} = require('../../models');

module.exports = async (req, res) => {
  try {
    const {
      categoricalValue,
      geneSymbol,
    } = req.query;

    const geneExpressionsFilter = { Symbol: geneSymbol };
    const yData = await Expression.find(geneExpressionsFilter).select({ Symbol: 1, 'Log TPM': 1, 'Model ID': 1 });

    let catData = null;
    let catModelVar = 'Model ID';
    if (categoricalValue === 'NIH Primary Tumour Type' || categoricalValue === 'NIH Tumour Subtype') {
      catData = await PDCModel.find({ 'Visible Externally': true }).select({ 'Model ID': 1, 'NIH Primary Tumour Type': 1, 'NIH Tumour Subtype': 1 });
    } else {
      catModelVar = 'PDC Model';
      catData = await ClinicalData.find({}).select(
        { 'PDC Model': 1, Age: 1, Stage: 1, Ethnicity: 1, 'Smoking History': 1 },
      );
    }

    const combinedData = [];
    const filterCategories = ['unknown', 'n/a', 'pending', ''];
    for (let i = 0; i < yData.length; i++) {
      const modelID = yData[i]['Model ID'];
      const temp = {};
      temp.id = modelID;
      temp.y = yData[i]['Log TPM'];
      let cat = catData.find((item) => (item[catModelVar] === modelID) && item);
      cat = cat.toJSON();
      if (categoricalValue === 'Age') {
        temp.cat = 'Age_NA';
        if (cat.Age && cat.Age > 60) {
          temp.cat = 'Age_60+';
        } else if (cat.Age && cat.Age >= 30 && cat.Age <= 60) {
          temp.cat = 'Age_30-60';
        } else if (cat.Age && cat.Age < 30) {
          temp.cat = 'Age_Below30';
        }
      } else {
        temp.cat = cat[categoricalValue] ? cat[categoricalValue].trim() : '';
      }
      if (!filterCategories.includes(temp.cat.toLowerCase())) {
        combinedData.push(temp);
      }
    }

    const labels = {
      xLabel: `${categoricalValue}`,
      yLabel: 'Log TPM',
      catLabel: 'Category',
    };

    return res.json({ data: combinedData, labels });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
