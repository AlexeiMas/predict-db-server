const treatmentData = require('../../data/treatmentInfo.json');
const responseData = require('../../data/responseTypes.json').responses;

const preparedTreatments = treatmentData.map((i) => i.Treatment);

const treatmentTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? preparedTreatments.filter((i) => re.test(i)) : preparedTreatments;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

const responseTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const re = new RegExp(search, 'i');
    const result = search ? responseData.filter((i) => re.test(i)) : responseData;

    return res.json(result);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  treatmentTypes,
  responseTypes,
};
