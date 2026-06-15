function Loading({ label = 'Loading...', size = 16, variant = 'inline' }) {
  const isPage = variant === 'page'
  const isScreen = variant === 'screen'
  const isLarge = isPage || isScreen

  return (
    <span role="status" aria-live="polite">
      <style>
        {`
          @keyframes loading-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: isLarge ? 'column' : 'row',
          gap: isLarge ? 14 : 8,
          minHeight: isScreen ? '100vh' : isPage ? 220 : 'auto',
          width: isLarge ? '100%' : 'auto',
          position: isScreen ? 'fixed' : 'static',
          inset: isScreen ? 0 : 'auto',
          zIndex: isScreen ? 9999 : 'auto',
          background: isScreen ? '#050508' : 'transparent',
          color: isLarge ? 'rgba(255,255,255,0.68)' : 'inherit',
          fontSize: isLarge ? 14 : 'inherit',
          fontWeight: isLarge ? 600 : 'inherit',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: isLarge ? 34 : size,
            height: isLarge ? 34 : size,
            border: `${isLarge ? 3 : 2}px solid currentColor`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'loading-spin 0.7s linear infinite',
          }}
        />
        <span>{label}</span>
      </span>
    </span>
  )
}

export default Loading
