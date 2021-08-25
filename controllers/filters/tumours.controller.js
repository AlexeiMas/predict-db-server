/* eslint-disable object-curly-newline */
const diagnosisData = require('../../data/diagnosisTypes.json');
const tumourData = require('../../data/tumourTypes.json');

(() => {
  const ascending = (a, b) => a.localeCompare(b);
  const NOT_FOUND = 'Not found';
  const collectedPrimary = tumourData.map((i) => i.primary);
  const uniqPrimary = [...new Set(collectedPrimary)].sort(ascending);

  const collectedSubs = tumourData.reduce((acc, i) => [...acc, ...i.sub.map((s) => s.name)], []);
  const uniqSubs = [...new Set(collectedSubs)].sort(ascending);

  const preparedTumourData = tumourData.map((i) => ({
    primary: i.primary,
    hasSubs: i.sub.length > 0,
  }));

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

  const mixedTypes = async (req, res) => {
    try {
      const shortestString = (a, b) => b.length - a.length;
      const byStartsWith = (search) => (b) => {
        const preparedSearch = search.replace(/,/g).split(/\s+/);
        const preparedB = b.toLowerCase().replace(/,/g).split(/\s+/);
        return preparedSearch.every((s) => preparedB.some((bb) => bb.startsWith(s)));
      };

      const loweredSearch = req.query.search.trim().toLowerCase();
      const filteredPrimary = uniqPrimary.filter(byStartsWith(loweredSearch)).sort(shortestString).reverse();
      const filteredSub = uniqSubs.filter(byStartsWith(loweredSearch)).sort(shortestString).reverse();

      const primary = loweredSearch ? filteredPrimary : uniqPrimary;
      const sub = loweredSearch ? filteredSub : uniqSubs;

      const result = { primary, sub };
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  };

  module.exports = { diagnosisTypes, primaryTypes, subTypes, mixedTypes };
})();
