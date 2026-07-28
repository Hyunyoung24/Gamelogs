import { useEffect, useState } from "react";
import { ERROR_EVENT } from "./toastBus";

function Toast() {
    // 여러 에러가 거의 동시에 발생해도(예: 게임/리뷰 목록이 둘 다 실패) 먼저 온 메시지가
    // 뒤에 온 메시지에 바로 덮여 사라지지 않도록 큐로 관리한다. 한 번에 하나씩, 순서대로 보여준다.
    const [queue, setQueue] = useState<string[]>([]);

    useEffect(() => {
        function handleError(e: Event) {
            const detail = (e as CustomEvent<string>).detail;
            setQueue((prev) => [...prev, detail]);
        }
        window.addEventListener(ERROR_EVENT, handleError);
        return () => window.removeEventListener(ERROR_EVENT, handleError);
    }, []);

    useEffect(() => {
        if (queue.length === 0) return;
        const timer = setTimeout(() => {
            setQueue((prev) => prev.slice(1));
        }, 3000);
        return () => clearTimeout(timer);
    }, [queue]);

    if (queue.length === 0) return null;

    return (
        <div className="toast" role="alert">
            {queue[0]}
        </div>
    );
}

export default Toast;
