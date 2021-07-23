const parseQuery = (queryObj) => {
  const reducer = (acc, key) => {
    acc[key] = JSON.parse(queryObj[key]);
    return acc;
  };
  return Object.keys(queryObj).reduce(reducer, {});
};

module.exports = { parseQuery };
