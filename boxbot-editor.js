/**
 * @param {string} selector
 * @constructor
 */
var BoxbotEditor = function (selector) {
  this.element = document.querySelector(selector)
  this.$lines = this.element.querySelector('.commander-lines')
  this.$textarea = this.element.querySelector('.commander-editor')
  this.$textarea.addEventListener('input', proxy(this, this.updateLines))
  this.$textarea.addEventListener('scroll', proxy(this, this.scroll))
  this.updateLines()
}

BoxbotEditor.prototype.scroll = function (event) {
  this.$lines.style.top = -event.target.scrollTop + 'px'
}

BoxbotEditor.prototype.updateLines = function () {
  var html = ''
  var codes = this.$textarea.value
  var lines = codes.match(/\n/g)
  lines = lines ? lines.length + 1 : 1

  for (var l = 1; l <= lines; l++) {
    html += '<div class="commander-lines-item">' + l + '</div>'
  }

  this.$lines.innerHTML = html
}

BoxbotEditor.prototype.getLines = function () {
  return this.element.querySelectorAll('.commander-lines-item')
}

BoxbotEditor.prototype.setFlag = function (line, flag) {
  this.getLines()[line].classList.add(flag)
}

BoxbotEditor.prototype.clearFlags = function () {
  var lines = this.getLines()
  for (var i = 0; i < lines.length; i += 1) {
    lines[i].className = 'commander-lines-item'
  }
}

BoxbotEditor.prototype.getCodes = function () {
  var codes = []
  this.$textarea.value.split('\n').forEach(function (code) {
    codes.push(code.trim())
  })
  return codes
}

BoxbotEditor.prototype.setCodes = function (codes) {
  this.$textarea.value = codes
  this.updateLines()
}