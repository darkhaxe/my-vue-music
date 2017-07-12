/**
 * Created by haze-Mac on 2017/7/5.
 */
import originJSONP from 'jsonp'
/** 提供es6风格的jsonp封装,返回Promise   */
/**
 *
 * @param url 比较纯净的地址,不带参数
 * @param data
 * @param option
 * @returns {Promise}
 */
export default function jsonp (url, data, option) {
  url += url.indexOf('?') > 0 ? '&' : '?' + parseParam(data)
  return new Promise((resolve, reject) => {
    // 原生jsonp库的设计,同时也是比较符合nodejs风格:err在前,data在后,假如获取成功,则err为空
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
// data是一个json对象 拼接参数到url
function parseParam (data) {
  let url = ''
  for (let key in data) {
    let value = data[key] !== undefined ? data[key] : ''
    // url += `&${key}=${encodeURIComponent(value)}` // 此处&用于标记功能
    url += '&' + key + '=' + encodeURIComponent(value)
  }
  // return的拼接完毕的参数不需要&,因此删除第一个字符,假如data不存在,拼接参数不成功,则不会存在&,返回''
  return url ? url.substring(1) : ''
}

