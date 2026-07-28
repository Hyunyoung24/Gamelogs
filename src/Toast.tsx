import { useEffect, useState } from "react";
import { ERROR_EVENT } from "./toastBus";

function Toast() {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        function handleError(e: Event) {
            const detail = (e as CustomEvent<string>).detail;
            setMessage(detail);
        }
        window.addEventListener(ERROR_EVENT, handleError);
        return () => window.removeEventListener(ERROR_EVENT, handleError);
    }, []);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    return (
        <div className="toast" role="alert">
            {message}
        </div>
    );
}

export default Toast;
