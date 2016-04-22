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
  setTimeout((function () {
    if (this.onResolve) {
      this.onResolve(value)
    }
  }).bind(this), 0)
}

Promise.prototype.reject = function (reason) {
  setTimeout((function () {
    if (this.onReject) {
      this.onReject(reason)
    }
  }).bind(this), 0)
}

Promise.prototype.then = function (onResolve, onReject) {
  this.onResolve = onResolve
  if (onReject) {
    this.onReject = onReject
  }
}

Promise.prototype.catch = function (onReject) {
  this.onReject = onReject
}