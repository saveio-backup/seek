const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTimeByTimestamp = timestamp => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatYearMonthDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
const formatYearMonthDayHour = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  return [year, month, day].map(formatNumber).join('-') +', ' + hour;
}
const formatMonthDay = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day].map(formatNumber).join('-')
}
const formatHourMinuteSecond = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute, second].map(formatNumber).join(':')
}
const formatHourMinute = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}
const calculateTimeLeft = (timeStampLeft) => {
  const flag = timeStampLeft >= 0;
  timeStampLeft = Math.abs(timeStampLeft);
  const days = Math.floor(timeStampLeft / (24 * 3600 * 1000)); // 剩余天数
  let millisecondLeft = timeStampLeft % (24 * 3600 * 1000); //计算天数后 剩余的毫秒数
  const hours = Math.floor(millisecondLeft / (3600 * 1000)); // 剩余小时
  millisecondLeft = millisecondLeft % (3600 * 1000); // 计算小时后 剩余的毫秒数
  const minutes = Math.floor(millisecondLeft / (60 * 1000)); // 剩余分钟数
  millisecondLeft = millisecondLeft % (60 * 1000); // 计算分钟后 剩余的毫秒数
  const seconds = Math.floor(millisecondLeft / 1000); // 剩余秒数
  return {
    days: flag ? days : days - (days * 2),
    hours,
    minutes,
    seconds
  }
}
const calculateTimeFuture = (targettime) => {
  const currentTime = new Date().getTime();
  if (targettime - currentTime > 0 && targettime - currentTime < 86400000 && (new Date(targettime).getDay() - new Date(currentTime).getDay() == 1)) {
    return '明天\n' + formatHourMinute(new Date(targettime))
  } else if (targettime - currentTime > 0 && targettime - currentTime < 86400000) { // 在今天
    return formatHourMinute(new Date(targettime))
  } else if (currentTime - targettime > 0 && currentTime - targettime < 86400000 && (new Date(currentTime).getDay() - new Date(targettime).getDay() == 1)) {
    return '昨天\n' + formatHourMinute(new Date(targettime))
  } else if (currentTime - targettime > 0 && currentTime - targettime < 86400000) {
    return formatHourMinute(new Date(targettime))
  } else {
    return formatMonthDay(new Date(targettime)) + '\n' + formatHourMinute(new Date(targettime))
  }
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTimeByTimestamp,
  formatTime: formatTime,
  formatYearMonthDay,
  formatMonthDay,
  formatHourMinuteSecond,
  formatHourMinute,
  calculateTimeLeft,
  calculateTimeFuture,
  formatYearMonthDayHour
}