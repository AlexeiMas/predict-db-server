const {
  Mutation, PDCModel, CopyNumber,
} = require('../../models');

module.exports = async (req, res) => {
  try {
    const {
      geneArr,
      tumourTypes,
    } = req.query;
    // finds the list of PDCModels that are a tumourType and are in the geneArr

    // pdc_model
    let finalTumourTypes = tumourTypes[0].slice(0, -1);
    finalTumourTypes = finalTumourTypes.replaceAll('[', '').split('],');
    const tumoursPDCModelFilter = {
      $or: [{ 'NIH Tumour Subtype': { $in: finalTumourTypes } }, { 'NIH Primary Tumour Type': { $in: finalTumourTypes } }],
    };
    const pdcModelData = await PDCModel.find(tumoursPDCModelFilter).select(
      {
        'Model ID': 1, 'NIH Tumour Subtype': 1, 'NIH Primary Tumour Type': 1,
      },
    );

    // getting only the models to map cells without alteration
    const models = [...new Set(pdcModelData.map((fd) => fd['Model ID']))];

    // gene query + sanitization
    const finalGeneArr = geneArr[0].split(',');

    const geneMutationPipeline = [
      {
        $match: {
          SYMBOL: { $in: finalGeneArr },
          'Model ID': { $in: models },
        },
      }, {
        $group: {
          _id: '$_id',
          'Model ID': { $first: '$Model ID' },
          SYMBOL: { $first: '$SYMBOL' },
          VARIANT_CLASS: { $first: '$VARIANT_CLASS' },
        },
      }, {
        $project: {
          'Model ID': 1,
          SYMBOL: 1,
          VARIANT_CLASS: { $concat: ['MUT'] },
        },
      },
    ];
    const mutationData = await Mutation.aggregate(geneMutationPipeline);

    // copy numbers query + sanitization
    const copyNumbersPipeline = [
      {
        $match: {
          Gene_name: { $in: finalGeneArr },
          'Model ID': { $in: models },
        },
      }, {
        $group: {
          _id: '$_id',
          'Model ID': { $first: '$Model ID' },
          SYMBOL: { $first: '$Gene_name' },
          VARIANT_CLASS: { $first: '$SV type' },
        },
      }, {
        $project: {
          'Model ID': 1,
          SYMBOL: 1,
          VARIANT_CLASS: 1,
        },
      },
    ];
    const copyNumbersData = await CopyNumber.aggregate(copyNumbersPipeline);

    // merging both datasets based ont he pdcmodel dataset
    const alterationsData = [...mutationData, ...copyNumbersData];

    // res
    return res.json({ data: alterationsData, models: pdcModelData });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
