const os = require('os')

module.exports = () => {
  const interfaces = os.networkInterfaces()

  for (let key in interfaces) {
    const items = interfaces[key]

    for (let i=0; i<items.length; i++) {
      const item = items[i]
      if (item.family === 'IPv4' && !item.internal && item.address !== '127.0.0.1') {
        return item.address
      }
    }
  }
}