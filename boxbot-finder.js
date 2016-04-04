var FinderNode = function (parent, position) {
  this.parent = parent
  this.position = position
  this.children = []
}

FinderNode.prototype.inParents = function (position, current) {
  current = current || this
  if (position[0] == current.position[0] && position[1] == current.position[1]) {
    return true
  }
  if (!current.parent) {
    return false
  }
  return this.inParents(position, current.parent)
}

FinderNode.prototype.getPath = function (current, path) {
  current = current || this
  path = path || []
  if (current.parent) {
    path.unshift(current.position)
    return this.getPath(current.parent, path)
  } else {
    return path
  }
}

/**
 * @constructor
 * @param {BoxbotMap} map
 */
var BoxbotFinder = function (map) {
  this.map = map
}

/**
 * 判断当前位置是否有效
 * @param {[int]} position
 * @returns {boolean}
 */
BoxbotFinder.prototype.isAvailable = function (position) {
  return this.map.getType(position) == 'null'
}

/**
 * 指定搜索算法并开始搜索
 *
 * @param {string} algorithm
 * @param {[int]} from
 * @param {[int]} to
 */
BoxbotFinder.prototype.search = function (algorithm, from, to) {
  return this[algorithm.toLowerCase()](from, to)
}

/**
 * 深度优先搜索
 *
 * @param {[int]} from
 * @param {[int]} to
 */
BoxbotFinder.prototype.dfs = function (from, to) {
  return this.deep_first_search(to, [from])
}

/**
 * @param {[int]} distance 目标距离
 * @returns {[{weight: int, position: [int]}]}
 */
BoxbotFinder.prototype.createPositions = function (distance) {
  var positions = [
    {position: [0, 1]}, {position: [-1, 0]}, {position: [0, -1]}, {position: [1, 0]}
  ].map(function (item) {
    item.weight = item.position[0] * distance[0] + item.position[1] * distance[1]
    return item
  })

  positions.sort(function (a, b) {
    return b.weight - a.weight
  })

  return positions
}

/**
 * 递归实现的深度优先搜索算法
 *
 * @param target
 * @param path
 * @param visited
 * @returns {[[int]]}
 */
BoxbotFinder.prototype.deep_first_search = function (target, path, visited) {
  visited = visited || {}

  var current = path[path.length - 1]
  if (current[0] == target[0] && current[1] == target[1]) {
    path.shift()
    return path
  }

  var positions = this.createPositions([target[0] - current[0], target[1] - current[1]])
  for (var i = 0; i < positions.length; i += 1) {
    var next = [positions[i].position[0] + current[0], positions[i].position[1] + current[1]]
    var positionKey = next[0] + '-' + next[1]

    if (this.isAvailable(next) && !visited[positionKey]) {
      path.push(next)
      visited[positionKey] = next

      var result = this.deep_first_search(target, path, visited)
      if (result) {
        return result
      }

      path.pop()
    }
  }
}

/**
 * 广度优先搜索
 *
 * @param {[int]} from
 * @param {[int]} to
 */
BoxbotFinder.prototype.bfs = function (from, to) {
  var offsets = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  var queue = [new FinderNode(null, from)]
  while (true) {
    var current = queue.shift()
    if (current.position[0] == to[0] && current.position[1] == to[1]) {
      return current.getPath()
    }
    for (var i = 0; i < offsets.length; i += 1) {
      var position = [current.position[0] + offsets[i][0], current.position[1] + offsets[i][1]]
      if (this.isAvailable(position) && !current.inParents(position)) {
        var node = new FinderNode(current, position)
        current.children.push(node)
        queue.push(node)
      }
    }
  }
}
