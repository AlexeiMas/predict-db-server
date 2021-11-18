const treatmentData = require('../../data/treatmentInfo.json');
const responseData = require('../../data/responseTypes.json').responses;

const preparedTreatments = treatmentData.map((i) => i.Treatment);

const treatmentTypes = async (req, res) => {
  try {
    const { search } = req.query;
    if (search.length === 0) return res.json(preparedTreatments);

    const result = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const re = new RegExp(item, 'i');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const filtered = preparedTreatments.filter((i) => equalsChar0(i, item) && re.test(i));
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
    if (search.length === 0) return res.json(responseData);

    const result = search.map((i) => i.trim()).reduce(
      (acc, item) => {
        if (!item) return acc;
        const re = new RegExp(item, 'i');
        const equalsChar0 = (s1, s2) => s1.charAt(0).toLowerCase() === s2.charAt(0).toLowerCase();
        const filtered = responseData.filter((i) => equalsChar0(i, item) && re.test(i));
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
  treatmentTypes,
  responseTypes,
};
