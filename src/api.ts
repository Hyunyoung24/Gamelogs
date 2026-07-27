import type { Game, Review } from "./types";

// 배포 환경에서는 .env.production의 VITE_API_URL을 사용, 없으면 로컬 개발 주소로 대체
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// 실패한 응답의 본문을 읽어 에러 메시지를 만든다.
// statusText는 HTTP/2 등 일부 환경에서 빈 문자열일 수 있어, 본문(res.text())을 우선 사용하고 없으면 statusText로 대체한다.
// res.text() 자체가 실패(네트워크 오류 등)해도 상태 코드는 남길 수 있도록 빈 문자열로 폴백한다.
// export된 이유: 단위 테스트에서 에러 포맷을 직접 검증할 수 있도록 하기 위함.
export async function createApiError(res: Response): Promise<Error> {
    const body = await res.text().catch(() => "");
    return new Error(`API 요청 실패: ${res.status} ${body || res.statusText}`);
}

// 응답이 실패(res.ok === false)면 에러를 던지고, 성공하면 JSON을 파싱해서 반환한다.
// fetch는 4xx/5xx여도 reject하지 않기 때문에, 호출부에서 이걸로 감싸지 않으면 실패한 요청도 조용히 성공한 것처럼 처리된다.
// 주의: 반환 타입 T는 런타임에 검증되지 않는 타입 단언이다. json-server가 항상 정해진 형태의 JSON을 준다는
// 전제로 사용하며, 스키마 검증이 필요해지면 이 지점에 Zod 등을 도입해야 한다.
// 주의: Response의 body 스트림은 한 번만 읽을 수 있다. 이 함수가 res를 소비하므로, 호출부는 이후
// 같은 res 객체로 res.text()/res.json()을 다시 호출하면 안 된다.
export async function parseResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        throw await createApiError(res);
    }
    try {
        return (await res.json()) as T;
    } catch {
        throw new Error(`JSON 파싱 실패: ${res.status}`);
    }
}

// 본문이 없는 응답(DELETE 등)에서 실패 여부만 확인할 때 사용한다.
export async function assertOk(res: Response): Promise<void> {
    if (!res.ok) {
        throw await createApiError(res);
    }
}

// 게임 목록 조회 (GET /games)
export async function getGames(): Promise<Game[]> {
    const res = await fetch(`${BASE_URL}/games`);
    return res.json();
}

// 게임 등록 (POST /games)
export async function createGame(
    data: Omit<Game, "id" | "liked">
): Promise<Game> {
    const res = await fetch(`${BASE_URL}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, liked: false }),
    });
    return res.json();
}

// 게임 수정 (PATCH /games/:id)
export async function updateGame(
    id: number,
    data: Partial<Game>
): Promise<Game> {
    const res = await fetch(`${BASE_URL}/games/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// 게임 삭제 (DELETE /games/:id)
export async function deleteGame(id: number): Promise<void> {
    await fetch(`${BASE_URL}/games/${id}`, {
        method: "DELETE",
    });
}

// 특정 게임의 리뷰 목록 조회 (GET /reviews?gameId=...)
export async function getReviews(gameId: number): Promise<Review[]> {
    const res = await fetch(`${BASE_URL}/reviews?gameId=${gameId}`);
    return res.json();
}

// 리뷰 작성 (POST /reviews)
export async function createReview(
    data: Omit<Review, "id">
): Promise<Review> {
    const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
}

// 리뷰 삭제 (DELETE /reviews/:id)
export async function deleteReview(id: number): Promise<void> {
    await fetch(`${BASE_URL}/reviews/${id}`, {
        method: "DELETE",
    });
}

// 전체 리뷰 조회 (GET /reviews) — 게임별 리뷰 개수 계산용
export async function getAllReviews(): Promise<Review[]> {
    const res = await fetch(`${BASE_URL}/reviews`);
    return res.json();
}