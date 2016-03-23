var boxbot = new Boxbot()
var editor = new BoxbotEditor('.boxbot-commander')

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

document.querySelector('#btn-run').addEventListener('click', function () {
  editor.clearFlags()
  var codes = editor.getCodes()

  // 检查命令是否有误
  for (var i = 0; i < codes.length; i += 1) {
    if (codes[i] && boxbot.parse(codes[i]) === false) {
      return editor.setFlag(i, 'error')
    }
  }

  // 依次运行命令
  codes.forEach(function (code, i) {
    if (code) {
      boxbot.exec(code).then(function () {
        editor.clearFlags()
        editor.setFlag(i, 'success')
      }).catch(function (e) {
        console.log(e)
        editor.clearFlags()
        editor.setFlag(i, 'warning')
      })
    }
  })
})

function reset() {
  boxbot.bot.goto([1, 1])
}

boxbot.bot.goto([1, 1])

//boxbot.map.set([5, 5], 'wall')
//boxbot.map.set([5, 6], 'wall')
//boxbot.map.set([5, 7], 'wall')
//boxbot.map.set([5, 8], 'wall')
//boxbot.map.set([3, 3], 'wall')
//boxbot.map.set([3, 4], 'wall')
//boxbot.map.set([3, 5], 'wall')
//boxbot.map.set([3, 6], 'wall')
//boxbot.map.set([1, 8], 'wall')
//boxbot.map.set([2, 8], 'wall')
//boxbot.map.set([3, 8], 'wall')
//boxbot.map.set([4, 8], 'wall')
//boxbot.map.set([6, 4], 'wall')
//boxbot.map.set([7, 4], 'wall')
//boxbot.map.set([8, 4], 'wall')
//boxbot.map.set([9, 4], 'wall')
//boxbot.exec('mov to 6,7')

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
