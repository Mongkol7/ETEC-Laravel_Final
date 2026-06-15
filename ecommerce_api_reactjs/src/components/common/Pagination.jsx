function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  return (
    <div className="pagination">
      <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange?.(currentPage - 1)}>
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange?.(currentPage + 1)}>
        Next
      </button>
    </div>
  )
}

export default Pagination
