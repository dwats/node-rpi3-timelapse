function log () { 
  console.log(`[${new Date()}] ${[...arguments].join(' ')}`)
}

module.exports = log
