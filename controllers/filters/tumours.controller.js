const diagnosisData = require('../../data/diagnosisTypes.json');
const tumourData = require('../../data/tumourTypes.json');

const preparedTumourData = tumourData.map((i) => ({
  primary: i.primary,
  hasSubs: i.sub.length > 0,
}));

const NOT_FOUND = 'Not found';

const diagnosisTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? diagnosisData.filter((i) => re.test(i)) : diagnosisData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const primaryTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? preparedTumourData.filter((i) => re.test(i.primary)) : preparedTumourData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const subTypes = async (req, res) => {
  try {
    const { primary, search } = req.query;
    const exists = tumourData.find((i) => i.primary === primary);

    if (!exists) return res.status(404).send(NOT_FOUND);

    const subs = exists.sub.map((i) => i.name);
    const re = new RegExp(search, 'i');
    const result = search ? subs.filter((i) => re.test(i)) : subs;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  diagnosisTypes,
  primaryTypes,
  subTypes,
};
