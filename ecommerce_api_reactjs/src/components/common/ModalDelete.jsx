function ModalDelete({ open, title = 'Delete item', onCancel, onConfirm }) {
  if (!open) return null

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <p>Are you sure you want to delete this item?</p>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default ModalDelete
