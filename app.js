var boxbot = new Boxbot()

document.addEventListener('keydown', function (event) {
  if (event.target.tagName == 'BODY') {
    var direction = {37: LEFT, 38: TOP, 39: RIGHT, 40: BOTTOM}[event.keyCode]
    if (typeof direction != 'undefined') {
      if (direction == boxbot.bot.getDirection()) {
        boxbot.run(boxbot.go)
      } else {
        boxbot.run(boxbot.turn, [direction])
      }
    }
  }
})

boxbot.bot.goto([1, 1])
boxbot.map.set([5, 5], 'wall')
boxbot.map.set([5, 6], 'wall')
boxbot.map.set([5, 7], 'wall')
boxbot.map.set([5, 8], 'wall')
boxbot.map.set([3, 3], 'wall')
boxbot.map.set([3, 4], 'wall')
boxbot.map.set([3, 5], 'wall')
boxbot.map.set([3, 6], 'wall')
boxbot.map.set([1, 8], 'wall')
boxbot.map.set([2, 8], 'wall')
boxbot.map.set([3, 8], 'wall')
boxbot.map.set([4, 8], 'wall')
boxbot.map.set([6, 4], 'wall')
boxbot.map.set([7, 4], 'wall')
boxbot.map.set([8, 4], 'wall')
boxbot.map.set([9, 4], 'wall')
boxbot.exec('mov to 6,7')
//boxbot.exec('tun lef')
//boxbot.exec('go')
//boxbot.exec('mov bot 2')
//boxbot.exec('biud')
//boxbot.exec('mov rig')
//boxbot.exec('mov bot')
//boxbot.exec('tun rig')
//boxbot.exec('bru #000')
//boxbot.exec('tra rig 2')
//boxbot.exec('tun lef')
//boxbot.exec('go 4')
//boxbot.exec('tun bac')

var editor = new BoxbotEditor('.boxbot-commander')
