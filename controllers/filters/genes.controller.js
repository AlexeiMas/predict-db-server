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

    const prepared = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const upper = new RegExp(item, 'gi');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const foundGene = allGenes.find((g) => equalsChar0(g, item) && upper.test(g));
        if (foundGene && acc.genes.includes(foundGene) === false) acc.genes.push(foundGene);

        const foundAlias = allAliases.find((g) => equalsChar0(g, item) && upper.test(g));
        if (foundAlias && acc.aliases.includes(foundAlias) === false) acc.aliases.push(foundAlias);

        const foundProtein = allProteins.find((g) => equalsChar0(g, item) && upper.test(g));
        if (foundProtein && acc.proteins.includes(foundProtein) === false) acc.proteins.push(foundProtein);

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
