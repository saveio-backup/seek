let DEFAULT_URL = null;
if (!process) {
  DEFAULT_URL = `file://${__dirname}/index.html`;
} else {
  DEFAULT_URL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080/` :
    `file://${__dirname}/index.html`
}
module.exports = {
  DEFAULT_URL,
  DEFAULT_PROTOCOL: 'seek',
  Y_POSITION: 80,
  X_POSITION:100
}