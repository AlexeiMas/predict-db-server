const genesData = require('../../data/genesNames.json');

const shortestString = (a, b) => a.length - b.length;
const get = (key) => (i) => i[key];

const allGenes = genesData.map(get('gene')).flat(1).sort(shortestString);
const allAliases = genesData.map(get('aliases')).flat(1).sort(shortestString);
const allProteins = genesData.map(get('protein')).flat(1).sort(shortestString);

module.exports = async function filterGenes(req, res) {
  try {
    const { search, limit, offset } = req.query;
    const re = new RegExp(`^${search}`, 'i');
    const genes = search ? allGenes.filter((i) => re.test(i)) : [];
    const aliases = search ? allAliases.filter((i) => re.test(i)) : [];
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
