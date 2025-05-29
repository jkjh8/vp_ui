const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0')
}

const msToHMS = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return '00:00:00'
  }
  let totalSeconds = Math.floor(milliseconds)
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`
}

export { msToHMS }
