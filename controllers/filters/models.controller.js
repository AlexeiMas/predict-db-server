const { PDCModel } = require('../../models');

module.exports = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {
      ...(search ? { 'Model ID': new RegExp(search, 'i') } : {}),
    };
    const models = await PDCModel
      .find(filter)
      .select({ 'Model ID': 1 })
      .lean();

    const result = models.map((i) => i['Model ID']);

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};
