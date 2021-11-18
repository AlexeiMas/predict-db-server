const logger = console;
const genesData = require('../../data/genesNames.json');

const shortestString = (a, b) => a.length - b.length;
const get = (key) => (i) => i[key];
const allGenes = genesData.map(get('gene')).flat(1).sort(shortestString);
const allAliases = genesData.map(get('aliases')).flat(1).sort(shortestString);
const allProteins = genesData.map(get('protein')).flat(1).sort(shortestString);

module.exports = async function filterGenes(req, res) {
  try {
    const { search, limit, offset } = req.query;

    if (search.length === 0) {
      const result = {
        genes: [...new Set(allGenes)],
        aliases: [...new Set(allAliases)],
        proteins: [...new Set(allProteins)],
      };

      const end = (+offset) + (+limit);

      return res.json({
        genes: result.genes.slice(offset, end),
        aliases: result.aliases.slice(offset, end),
        proteins: result.proteins.slice(offset, end),
        genesCount: result.genes.length,
        aliasesCount: result.aliases.length,
        proteinsCount: result.proteins.length,
      });
    }

    const sorter = (a, b) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    };

    const prepared = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const upper = new RegExp(item, 'gi');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const strictEquals = (s1, s2) => s1.trim().toLowerCase() === s2.trim().toLowerCase();

        const comparator = (toCompare) => {
          if (/true/gi.test(req.query.strictEqual)) return strictEquals(toCompare, item);
          return equalsChar0(toCompare, item) && upper.test(toCompare);
        };

        const filteredGenes = allGenes.filter(comparator);
        acc.genes = [...new Set([...acc.genes, ...(filteredGenes)])].sort(sorter);

        const filteredAliases = allAliases.filter(comparator);
        acc.aliases = [...new Set([...acc.aliases, ...(filteredAliases)])].sort(sorter);

        const filteredProteins = allProteins.filter(comparator);
        acc.proteins = [...new Set([...acc.proteins, ...(filteredProteins)])].sort(sorter);

        return acc;
      },
      { genes: [], aliases: [], proteins: [] },
    );

    const end = (+offset) + (+limit);

    return res.json({
      genes: prepared.genes.slice(offset, end),
      aliases: prepared.aliases.slice(offset, end),
      proteins: prepared.proteins.slice(offset, end),
      genesCount: prepared.genes.length,
      aliasesCount: prepared.aliases.length,
      proteinsCount: prepared.proteins.length,
    });
  } catch (error) {
    const fileName = __filename.split('/')[__filename.split('/').length - 1];
    logger.info(`\v[ERROR][ ${fileName} ]`, error.stack, '\v');
    return res.status(500).send(error.message);
  }
};
