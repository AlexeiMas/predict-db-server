const genesData = require('../../data/genesNames.json');

module.exports = async (req, res) => {
  try {
    const { search, limit, offset } = req.query;
    const re = new RegExp(`^${search}`, 'i');

    const allGenes = genesData.map((i) => i.gene);
    const allAliases = genesData.map((i) => i.aliases);
    const allProteins = genesData.map((i) => i.protein);

    const genes = search ? allGenes.filter((i) => re.test(i)) : [];
    const aliases = search ? allAliases.filter((i) => re.test(i)).reduce((acc, i) => [...acc, ...i], []) : [];
    const proteins = search ? allProteins.filter((i) => re.test(i)) : [];

    const result = {
      genes: [...new Set(genes)],
      aliases: [...new Set(aliases)],
      proteins: [...new Set(proteins)],
    };

    const end = offset + limit;

    return res.json({
      genes: result.genes.slice(offset, end),
      aliases: result.aliases.slice(offset, end),
      proteins: result.proteins.slice(offset, end),
      genesCount: result.genes.length,
      aliasesCount: result.aliases.length,
      proteinsCount: result.proteins.length,
    });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
