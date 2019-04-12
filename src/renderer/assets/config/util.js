const result = {
  bytesToSize(bytes) {
    if (bytes === 0) return '0 B';

    var k = 1024;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    i = Math.floor(Math.log(bytes) / Math.log(k));



    var num = bytes / Math.pow(k, i);
    return num.toPrecision(3) + ' ' + sizes[i];

  }
}
module.exports = result;