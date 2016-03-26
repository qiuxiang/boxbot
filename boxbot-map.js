/**
 * @constructor
 * @param {string} selector
 */
var BoxbotMap = function (selector) {
  this.element = document.querySelector(selector)
}

/**
 * 创建地图
 * 
 * @param {int} columns
 * @param {int} rows
 */
BoxbotMap.prototype.create = function (columns, rows) {
  var html = ''
  for (var y = 0; y <= rows; y += 1) {
    html += '<tr>'
    for (var x = 0; x <= columns; x += 1) {
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
  this.columns = columns
  this.rows = rows
  this.element.innerHTML = html
  this.boxs = this.element.getElementsByTagName('td')
}

/**
 * 清除地图数据
 */
BoxbotMap.prototype.clear = function () {
  for (var y = 1; y <= this.rows; y += 1) {
    for (var x = 1; x <= this.columns; x += 1) {
      var box = this.get([x, y])
      box.style.backgroundColor = ''
      box.dataset.type = 'null'
    }
  }
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
 * 设置指定位置的方块颜色
 *
 * @param {[int]} position
 * @param color
 */
BoxbotMap.prototype.setColor = function (position, color) {
  this.get(position).style.backgroundColor = color
}

/**
 * 判断指定位置是否为空
 *
 * @param {[int]} position
 * @returns {string}
 */
BoxbotMap.prototype.getType = function (position) {
  var box = this.get(position)
  return box && box.dataset.type
}
