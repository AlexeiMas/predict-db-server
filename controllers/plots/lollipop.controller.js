const fs = require('fs');

const UNIPROT_PATH = require('path').resolve(__dirname, '../../data/UniProt.txt');

const {
  Mutation,
} = require('../../models');

module.exports = async (req, res) => {
  try {
    const {
      geneSymbol,
    } = req.query;
    // Create the pipeline to request the mutation
    // AAChange is the Protein Change = 1 Lollipop / Y Axis
    // Frequency is the amount of times the AAChange repeats it self
    // Amino Acids number is the number inside the AAChange = X Axis
    const mutationPipeline = [{
      $match: {
        SYMBOL: geneSymbol,
      },
    }, {
      $group: {
        _id: '$AAChange',
        frequency: { $sum: 1 },
        'Model ID': { $first: '$Model ID' },
        Consequence: { $first: '$Consequence' },
        SYMBOL: { $first: '$SYMBOL' },
        VARIANT_CLASS: { $first: '$VARIANT_CLASS' },
        CLIN_SIG: { $first: '$CLIN_SIG' },
        IMPACT: { $first: '$IMPACT' },
      },
    }, {
      $project: {
        _id: 0,
        AAChange: '$_id',
        frequency: 1,
        'Model ID': 1,
        Consequence: 1,
        SYMBOL: 1,
        VARIANT_CLASS: 1,
        CLIN_SIG: 1,
        IMPACT: 1,
      },
    }];
    const lollipopData = await Mutation.aggregate(mutationPipeline)
      .then((md) => md.map((m) => ({ ...m, 'Amino Acid Number': parseInt(m.AAChange.match(/\d/g).join('')) }))
        .sort((a, b) => a['Amino Acid Number'] - b['Amino Acid Number']));

    // Create filter for the table plot
    const mutationFilter = { SYMBOL: geneSymbol };
    const tableData = await Mutation.find(mutationFilter);
    // UniProt Data for the horizontal bar domain plot
    const txt = fs.readFileSync(UNIPROT_PATH, 'utf-8');
    const txtArr = txt.split('\r').map((tx) => tx.split('\t').map((t) => t.trim()));
    const uniProtData = txtArr.filter((tx) => tx[0].startsWith(geneSymbol));
    // res
    return res.json({ lollipopData, tableData, uniProtData });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
