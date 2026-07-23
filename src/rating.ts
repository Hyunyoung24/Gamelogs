import type { Review } from "./types";

// 리뷰 평점 평균 계산, 리뷰 없으면 0 반환
export function averageRating(gameId: number, reviews: Review[]): number {
    const gameReviews = reviews.filter((r) => r.gameId === gameId);
    if (gameReviews.length === 0) return 0;
    const sum = gameReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / gameReviews.length;
}