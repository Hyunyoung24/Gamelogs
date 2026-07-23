import type { Game, Review } from "./types";

const BASE_URL = "http://localhost:3000";

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