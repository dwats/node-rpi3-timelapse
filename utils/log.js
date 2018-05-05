function log () { 
  console.log(`${[...arguments].join(' ')}`)
}

module.exports = log
