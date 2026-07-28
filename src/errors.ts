// API 호출 실패를 콘솔에 남기고 사용자에게 알린다.
// TODO: alert()는 브라우저 UI를 막는 방식이라 UX상 아쉬움. 프로젝트가 커지면 토스트 컴포넌트로 교체할 것.
export function reportError(e: unknown, message: string) {
    console.error(e);
    alert(message);
}
