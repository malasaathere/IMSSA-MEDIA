import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Crash:", error, errorInfo);
    this.setState({ error, errorInfo });
    // Attempt to clear potentially corrupted state
    localStorage.removeItem('imssa-jwt-token');
    localStorage.removeItem('imssa-access-token');
    localStorage.removeItem('imssa-refresh-token');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#fee' }}>
          <h1>Something went wrong.</h1>
          <p>The application crashed. Local storage has been automatically cleared to try to fix this issue. Please refresh the page.</p>
          <button onClick={() => window.location.href = '/login'} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>
            Go to Login
          </button>
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
            {this.state.error?.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
