const collectionData = require('../../data/treatmentCollectionTypes.json');
const treatmentData = require('../../data/historyTreatmentTypes.json');
const responsesData = require('../../data/responseTypes.json').history;

const collectionTypes = async (req, res) => {
  try {
    const { search } = req.query;
    if (search.length === 0) return res.json(collectionData);

    const result = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const re = new RegExp(item, 'i');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const filtered = collectionData.filter((i) => equalsChar0(i, item) && re.test(i));
        return [...acc, ...filtered];
      },
      [],
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const treatmentTypes = async (req, res) => {
  try {
    const { search } = req.query;
    if (search.length === 0) return res.json(treatmentData);

    const result = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const re = new RegExp(item, 'i');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const filtered = treatmentData.filter((i) => equalsChar0(i, item) && re.test(i));
        return [...acc, ...filtered];
      },
      [],
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const responseTypes = async (req, res) => {
  try {
    const { search } = req.query;
    if (search.length === 0) return res.json(responsesData);

    const result = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const re = new RegExp(item, 'i');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const filtered = responsesData.filter((i) => equalsChar0(i, item) && re.test(i));
        return [...acc, ...filtered];
      },
      [],
    );
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
