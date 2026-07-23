import { useState } from "react";
import type { Game, Review } from "./types";
import { averageRating } from "./rating";
import DetailModal from "./DetailModal";

interface BestRankingProps {
    games: Game[];
    reviews: Review[];
}

type SortKey = "rating" | "liked" | "reviews";

function BestRanking({ games, reviews }: BestRankingProps) {
    const [sortKey, setSortKey] = useState<SortKey>("rating");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    function reviewCount(gameId: number) {
        return reviews.filter((r) => r.gameId === gameId).length;
    }

    const sortedGames = games.slice().sort((a, b) => {
        if (sortKey === "rating") return averageRating(b.id, reviews) - averageRating(a.id, reviews);
        if (sortKey === "liked") return Number(b.liked) - Number(a.liked);
        return reviewCount(b.id) - reviewCount(a.id);
    });

    const selectedGame = games.find((g) => g.id === selectedId) ?? null;

    return (
        <div>
            <h1 className="page-title">베스트 랭킹</h1>
            <p className="page-sub">평점, 리뷰 수, 찜 수를 기준으로 순위를 매겨요.</p>
            <div className="rank-tabs">
                <span
                    className={`rank-tab ${sortKey === "rating" ? "active" : ""}`}
                    onClick={() => setSortKey("rating")}
                >
                    평점순
                </span>
                <span
                    className={`rank-tab ${sortKey === "reviews" ? "active" : ""}`}
                    onClick={() => setSortKey("reviews")}
                >
                    리뷰순
                </span>
                <span
                    className={`rank-tab ${sortKey === "liked" ? "active" : ""}`}
                    onClick={() => setSortKey("liked")}
                >
                    찜 많은 순
                </span>
            </div>
            <div>
                {sortedGames.map((game, index) => {
                    const rating = averageRating(game.id, reviews);
                    return (
                        <div className="rank-row" key={game.id} onClick={() => setSelectedId(game.id)}>
                            <span className="rank-num">{index + 1}</span>
                            <div className="rank-info">
                                <p className="rank-title">{game.title}</p>
                                <p className="rank-genre">{game.genre.join(" · ")}</p>
                            </div>
                            <span className="rank-stat">
                                {rating === 0 ? "리뷰 없음" : `★ ${rating.toFixed(1)}`}
                            </span>
                        </div>
                    );
                })}
            </div>
            <DetailModal game={selectedGame} onClose={() => setSelectedId(null)} />
        </div>
    );
}

export default BestRanking;