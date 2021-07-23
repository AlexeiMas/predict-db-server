const collectionData = require('../../data/treatmentCollectionTypes.json');
const treatmentData = require('../../data/historyTreatmentTypes.json');
const responsesData = require('../../data/responseTypes.json').history;

const collectionTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? collectionData.filter((i) => re.test(i)) : collectionData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const treatmentTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? treatmentData.filter((i) => re.test(i)) : treatmentData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const responseTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? responsesData.filter((i) => re.test(i)) : responsesData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  collectionTypes,
  treatmentTypes,
  responseTypes,
};
