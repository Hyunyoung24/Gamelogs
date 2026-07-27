import type { Game, Review } from "./types";

// 배포 환경에서는 .env.production의 VITE_API_URL을 사용, 없으면 로컬 개발 주소로 대체
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// 응답이 실패(res.ok === false)면 에러를 던지고, 성공하면 JSON을 파싱해서 반환한다.
// fetch는 4xx/5xx여도 reject하지 않기 때문에, 호출부에서 이걸로 감싸지 않으면 실패한 요청도 조용히 성공한 것처럼 처리된다.
export async function parseResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

// 본문이 없는 응답(DELETE 등)에서 실패 여부만 확인할 때 사용한다.
export function assertOk(res: Response): void {
    if (!res.ok) {
        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
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