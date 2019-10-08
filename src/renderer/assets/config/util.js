const result = {
  bytesToSize(bytes) {
    if (bytes === 0) return '0 Byte';
    var k = 1024;

    sizes = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));



    var num = bytes / Math.pow(k, i);
    return num.toFixed(2) + ' ' + sizes[i];

  },
  filterFloat(value) {
    if (/^(\-|\+)?|(\.\d+)(\d+(\.\d+)?|(\d+\.)|Infinity)$/
      .test(value))
      return Number(value);
    return NaN;
  },
  effectiveNumber(value) {
    var m = Number(value)
      .toExponential()
      .match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return Number(value).toFixed(Math.max(0, (m[1] || "").length - m[2]));
  }
}
module.exports = result;