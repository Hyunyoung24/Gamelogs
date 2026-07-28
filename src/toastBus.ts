// Toast.tsx가 이 이벤트를 구독해서 화면에 메시지를 띄운다.
// Context 없이 커스텀 이벤트로 느슨하게 연결하기 위한 순수 함수/상수만 여기 둔다.
// (Toast.tsx에 같이 두면 react-refresh가 "컴포넌트 파일은 컴포넌트만 export해야 한다"고 경고한다.)
export const ERROR_EVENT = "app-error";

export function dispatchError(message: string) {
    window.dispatchEvent(new CustomEvent<string>(ERROR_EVENT, { detail: message }));
}
