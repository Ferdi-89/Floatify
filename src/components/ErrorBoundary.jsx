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
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    color: '#ff5555',
                    background: '#121212',
                    height: '100vh',
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>Something went wrong.</h1>
                    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                        <h2 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#fff' }}>Error:</h2>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</pre>
                    </div>
                    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
                        <h2 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#fff' }}>Stack Trace:</h2>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px', color: '#aaa' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#1db954',
                            color: 'black',
                            border: 'none',
                            borderRadius: '99px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: 'fit-content'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
