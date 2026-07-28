// 목록/베스트랭킹 로딩 중에 보여줄 안내 문구
function LoadingNotice() {
    return (
        <p className="loading-notice">
            서버 준비 중입니다. 첫 로딩이 다소 걸릴 수 있으니 잠시만 기다려주세요.
        </p>
    );
}

export default LoadingNotice;
