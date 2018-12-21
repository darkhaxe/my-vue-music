// uuid
export function uuid () {
  let _uid = ''
  if (_uid) {
    return _uid
  }
  if (!_uid) {
    const t = (new Date()).getUTCMilliseconds()
    _uid = '' + Math.round(2147483647 * Math.random()) * t % 1e10
  }
  return _uid
}

// 数值补0
function pad (num, n = 2) {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}

export function formatTime (interval) {
  interval = Math.floor(interval)
  const minute = Math.floor(interval / 60)
  const second = pad(interval % 60)
  return `${minute}:${second}`
}
