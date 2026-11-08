const humanReadableFileSize = (size) => {
  if (!size) return '0 B'
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${['B', 'KB', 'MB', 'GB'][i]}`
}
const firstCharUpperCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export { humanReadableFileSize, firstCharUpperCase }
