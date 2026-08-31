import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8">
                    <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                            Algo salió mal
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Ha ocurrido un error inesperado. Puedes intentar de nuevo o recargar la página.
                        </p>
                        {this.state.error && (
                            <p className="text-sm text-gray-400 mb-4 break-all">
                                {this.state.error.message}
                            </p>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reintentar
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Recargar página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
