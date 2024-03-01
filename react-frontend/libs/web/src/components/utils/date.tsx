const monthNames: { [name: number]: string} = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
}

// takes unix epoch in seconds
export function getDateString(unixEpoch: number): string {
  const now = Date.now() / 1000
  const diff = now - unixEpoch

  if (diff < 60) {
    return `${diff.toFixed(0)}s`
  }

  if (diff < 60 * 60) {
    return `${(diff / 60).toFixed(0)}m`
  }

  if (diff < 24 * 60 * 60) {
    return `${(diff / 60 / 60).toFixed(0)}h`
  }

  if (diff < 4 * 24 * 60 * 60) {
    return `${(diff / 24 / 60 / 60).toFixed(0)}d`
  }

  const date = new Date(unixEpoch * 1000)

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const monthName = monthNames[month];

  return `${monthName} ${day}, ${year}`
}