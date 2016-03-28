/**
 * @constructor
 */
var ImageReader = function () {
  this.image = document.createElement('img')
  this.canvas = document.createElement('canvas').getContext('2d')
  this.reader = new FileReader()
  this.reader.addEventListener('load', this.load.bind(this))
}

/**
 * 读取图片数据
 *
 * @param {Blob} file
 * @param {int} width
 * @param {int} height
 * @returns {Promise}
 */
ImageReader.prototype.read = function (file, width, height) {
  return new Promise((function (resolve) {
    this.width = width
    this.height = height
    this.reader.readAsDataURL(file)
    this.resolve = resolve
  }).bind(this))
}

ImageReader.prototype.load = function () {
  this.image.src = this.reader.result
  this.canvas.drawImage(this.image, 0, 0, this.width, this.height)
  var data = []
  for (var y = 0; y < this.width; y += 1) {
    data.push([])
    for (var x = 0; x < this.height; x += 1) {
      data[y].push(this.toRGBA(this.canvas.getImageData(x, y, 1, 1).data))
    }
  }
  this.resolve(data)
}

/**
 * RGBA 数组转十六进制
 *
 * @param {CanvasPixelArray} pixel
 * @returns {string}
 */
ImageReader.prototype.toRGBA = function (pixel) {
  return 'rgba(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ',' + pixel[2] + ')'
}
