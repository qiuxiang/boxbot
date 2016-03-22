/**
 * @constructor
 * @param {string} selector
 * @param {int} columns
 * @param {int} rows
 */
var BoxbotMap = function (selector, columns, rows) {
  this.element = document.querySelector(selector)
  this.columns = columns
  this.rows = rows
  this.init()
}

/**
 * 初始化，生成地图
 */
BoxbotMap.prototype.init = function () {
  var html = ''
  for (var y = 0; y <= this.rows; y += 1) {
    html += '<tr>'
    for (var x = 0; x <= this.columns; x += 1) {
      if (x == 0 && y == 0) {
        html += '<td></td>'
      } else {
        if (y == 0) {
          html += '<td class="boxbot-box" data-type="x-axis">' + x + '</td>'
        } else if (x == 0) {
          html += '<td class="boxbot-box" data-type="y-axis">' + y + '</td>'
        } else {
          html += '<td class="boxbot-box" data-type="null"></td>'
        }
      }
    }
    html += '</tr>'
  }
  this.element.innerHTML = html
  this.boxs = this.element.getElementsByTagName('td')
}

/**
 * 获取指定位置的方块
 *
 * @param {[int]} position
 * @returns {Element}
 */
BoxbotMap.prototype.get = function (position) {
  return this.boxs[position[1] * (this.rows + 1) + position[0]]
}

/**
 * 设置指定位置的方块类型
 *
 * @param {[int]} position
 * @param type
 */
BoxbotMap.prototype.set = function (position, type) {
  this.get(position).dataset.type = type
}

/**
 * 判断指定位置是否为空
 *
 * @param {[int]} position
 * @returns {boolean}
 */
BoxbotMap.prototype.isNull = function (position) {
  var box = this.get(position)
  return box && box.dataset.type == 'null'
}
