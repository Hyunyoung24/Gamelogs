import { dispatchError } from "./toastBus";

// API 호출 실패를 콘솔에 남기고 사용자에게 알린다.
// e가 없는 경우(예: 여러 실패를 하나로 합쳐 알릴 때)는 의미 없는 console.error(null)을 남기지 않는다.
export function reportError(e: unknown, message: string) {
    if (e != null) {
        console.error(e);
    }
    dispatchError(message);
}
