export const formatDate = (value) => {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US').format(new Date(value))
}
