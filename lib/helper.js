module.exports = {
  stringBetween: (input, start, end) => {
    return input.match(new RegExp(`${start}([\\S\\s]*?)${end}`))[1];
  },
  toNumber: (input) => {
    return Number(input.replace(/,/g, ""));
  },
  tdValue: input => {
    return input.match(/<td\b[^>]*?>(.*?)<\/td>/g);
  },
  removeHtml: input => {
    return input.replace(/<[^>]*>?/gm, '');
  },
};
