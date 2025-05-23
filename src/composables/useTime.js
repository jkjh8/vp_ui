const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0')
}

const msToHMS = (milliseconds) => {
  let seconds = Math.floor(milliseconds)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  seconds = seconds % 60
  minutes = minutes % 60
  hours = hours % 24

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export { msToHMS }
