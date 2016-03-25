/**
 * @constructor
 * @param {string} selector
 */
var BoxbotEditor = function (selector) {
  this.element = document.querySelector(selector)
  this.$lines = this.element.querySelector('.commander-lines')
  this.$textarea = this.element.querySelector('.commander-editor')
  this.$textarea.addEventListener('input', this.update.bind(this))
  this.$textarea.addEventListener('scroll', this.scroll.bind(this))
  this.update()
}

/**
 * 代码行数同步滚动
 * 
 * @param event
 */
BoxbotEditor.prototype.scroll = function (event) {
  this.$lines.style.top = -event.target.scrollTop + 'px'
}

/**
 * 滚动到制定行数
 * 
 * @param line
 */
BoxbotEditor.prototype.scrollTo = function (line) {
  this.$textarea.scrollTop = line * 20
}

/**
 * 更新代码行数
 */
BoxbotEditor.prototype.update = function () {
  var html = ''
  var codes = this.$textarea.value
  var lines = codes.match(/\n/g)
  lines = lines ? lines.length + 1 : 1

  for (var l = 1; l <= lines; l++) {
    html += '<div class="commander-lines-item">' + l + '</div>'
  }

  this.$lines.innerHTML = html
}

/**
 * @returns {NodeList}
 */
BoxbotEditor.prototype.getLines = function () {
  return this.element.querySelectorAll('.commander-lines-item')
}

/**
 * 设置标记
 * 
 * @param {int} line
 * @param {string} flag
 */
BoxbotEditor.prototype.setFlag = function (line, flag) {
  this.getLines()[line].classList.add(flag)
}

/**
 * 清除标记
 * 
 * @param {int} [line] 默认清除所有标记
 */
BoxbotEditor.prototype.clearFlag = function (line) {
  var lines = this.getLines()
  if (line) {
    lines[line].className = 'commander-lines-item'
  } else {
    for (var i = 0; i < lines.length; i += 1) {
      lines[i].className = 'commander-lines-item'
    }
  }
}

/**
 * 获取代码列表
 * 
 * @returns {[string]}
 */
BoxbotEditor.prototype.getCodes = function () {
  var codes = []
  this.$textarea.value.split('\n').forEach(function (code) {
    codes.push(code.trim())
  })
  return codes
}

/**
 * 设置编辑器代码，同时触发更新
 * 
 * @param codes
 */
BoxbotEditor.prototype.setCodes = function (codes) {
  this.$textarea.value = codes
  this.update()
}