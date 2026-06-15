function InputField({ label, id, error, ...props }) {
  return (
    <div className="form-field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...props} />
      {error && <small className="field-error">{error}</small>}
    </div>
  )
}

export default InputField
