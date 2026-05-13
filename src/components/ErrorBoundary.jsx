import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              marginTop: "10px"
            }}
          >
            Click here to reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
