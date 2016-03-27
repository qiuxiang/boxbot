/**
 * 简易版 Promise，非标准实现，只兼容一小部分用法
 *
 * @param {function} executor
 * @constructor
 */
var Promise = function (executor) {
  executor(this.resolve.bind(this), this.reject.bind(this))
}

Promise.prototype.resolve = function (value) {
  if (this.onResolve) {
    this.onResolve(value)
  }
}

Promise.prototype.reject = function (reason) {
  if (this.onReject) {
    this.onReject(reason)
  }
}

Promise.prototype.then = function (onResolve, onReject) {
  this.onResolve = onResolve
  this.onReject = onReject
}