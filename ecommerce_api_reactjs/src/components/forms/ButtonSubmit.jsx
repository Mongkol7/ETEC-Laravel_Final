function ButtonSubmit({ children = 'Submit', loading = false, ...props }) {
  return (
    <button type="submit" disabled={loading} {...props}>
      {loading ? 'Please wait...' : children}
    </button>
  )
}

export default ButtonSubmit
