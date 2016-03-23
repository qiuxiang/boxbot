var BOTTOM = 0
var LEFT = 90
var TOP = 180
var RIGHT = 270

/**
 * 简易版 jQuery.proxy()
 *
 * @param {*} context
 * @param {function} func
 * @param {[]} [params]
 * @returns {function}
 */
function proxy(context, func, params) {
  return function () {
    if (arguments.length > 0) {
      params = arguments
    }
    func.apply(context, params)
  }
}
