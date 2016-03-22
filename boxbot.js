/**
 * @constructor
 */
var Boxbot = function () {
  this.bot = new BoxbotBot('.boxbot-bot')
  this.map = new BoxbotMap('.boxbot-map', 10, 10)
}

/**
 * 朝指定方向旋转并移动
 *
 * @param direction 方向
 * @param step 步数
 */
Boxbot.prototype.move = function (direction, step) {
  boxbot.bot.turn(direction)
  boxbot.bot.move(direction, step)
}

var boxbot = new Boxbot()
boxbot.bot.goto([1, 1])
boxbot.move('right', 2)
