import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep this minimal; real apps can report to monitoring here.
    // eslint-disable-next-line no-console
    console.error('UI error boundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page">
          <div className="empty empty--error">
            <h2>Something went wrong</h2>
            <p>Please refresh the page. If the issue continues, contact support.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
