let DEFAULT_URL = null;
if (!process) {
  DEFAULT_URL = `file://${__dirname}/index.html`;
} else {
  DEFAULT_URL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080/` :
    `file://${__dirname}/index.html`
  console.log(DEFAULT_URL);

}
module.exports = {
  DEFAULT_CHAINID: '1',
  DEFAULT_URL,
  DEFAULT_PROTOCOL: 'seek',
  Y_POSITION: 63,
  X_POSITION: 40
}