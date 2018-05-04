function pad (number, padding) {
  let numStr = number.toString()
  const toPad = padding - numStr.length

  for (let i = 0; i < toPad; i++) {
    numStr = '0' + numStr
  }

  return numStr
}

module.exports = pad
