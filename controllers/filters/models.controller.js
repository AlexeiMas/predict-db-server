const { PDCModel } = require('../../models');

module.exports = async (req, res) => {
  try {
    const { search } = req.query;

    if (search.length === 0) {
      const filter = { 'Visible Externally': true };
      const found = await PDCModel
        .find(filter)
        .select({ 'Model ID': 1 })
        .lean();
      const collected = found.map((i) => i['Model ID']);

      return res.json(collected);
    }

    const result = await search.map((i) => i.trim()).reduce(
      async (acc, item) => {
        const collector = await acc;
        if (!item) return collector;
        const filter = { 'Visible Externally': true, 'Model ID': { $regex: new RegExp(item, 'gi') } };
        const found = await PDCModel
          .find(filter)
          .select({ 'Model ID': 1 })
          .lean();
        const collected = found.map((i) => i['Model ID']);
        return [...collector, ...collected];
      },
      [],
    );

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
