import { useState } from "react";
import type { Game, Review } from "./types";
import { genres as gameGenres } from "./types";
import { averageRating } from "./rating";
import GameCard from "./GameCard";
import DetailModal from "./DetailModal";

interface GameListProps {
    games: Game[];
    reviews: Review[];
    loading: boolean;
    onToggleLike: (id: number) => void;
}

type SortOption = "rating-desc" | "rating-asc" | "reviews-desc" | "reviews-asc" | "name-asc" | "name-desc";

// 로딩 중 보여줄 스켈레톤 카드 개수. 화면 크기에 따라 정확히 맞출 필요는 없어서 고정값으로 둔다.
const SKELETON_CARD_COUNT = 8;

function GameList({ games, reviews, loading, onToggleLike }: GameListProps) {
    const [activeGenres, setActiveGenres] = useState<string[]>([]);
    const [filterMode, setFilterMode] = useState<"or" | "and">("or");
    const [sortOption, setSortOption] = useState<SortOption>("rating-desc");
    const [likedOnly, setLikedOnly] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);



    function handleSelect(id: number) {
        setSelectedId(id);
    }

    function reviewCount(gameId: number) {
        return reviews.filter((r) => r.gameId === gameId).length;
    }

    // 클릭한 장르가 이미 배열에 있으면 빼고 없으면 넣는 함수
    const handleGenreToggle = (g: string) => {
        setActiveGenres((prev) =>
            prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
        );
    };

    // 장르 필터 -> 찜 필터 -> 정렬 순서로 적용
    const visibleGames = games
        .filter((g) => {
            if (activeGenres.length === 0) return true;
            return filterMode === "or"
                ? activeGenres.some((genre) => g.genre.includes(genre))
                : activeGenres.every((genre) => g.genre.includes(genre));
        })
        .filter((g) => !likedOnly || g.liked)
        .slice()
        .sort((a, b) => {
            switch (sortOption) {
                case "rating-desc": return averageRating(b.id, reviews) - averageRating(a.id, reviews);
                case "rating-asc": return averageRating(a.id, reviews) - averageRating(b.id, reviews);
                case "reviews-desc": return reviewCount(b.id) - reviewCount(a.id);
                case "reviews-asc": return reviewCount(a.id) - reviewCount(b.id);
                case "name-asc": return a.title.localeCompare(b.title, "ko");
                case "name-desc": return b.title.localeCompare(a.title, "ko");
            }
        });

    const selectedGame = games.find((g) => g.id === selectedId) ?? null;

    return (
        <>
            <h1 className="page-title">게임 목록</h1>
            <p className="page-sub">플레이한 게임을 평가하고 찜해보세요.</p>
            <div className="filter-bar">
                <div className="chips">
                    <button
                        type="button"
                        className={`chip ${activeGenres.length === 0 ? "active" : ""}`}
                        disabled={loading}
                        onClick={() => setActiveGenres([])}
                    >
                        전체
                    </button>
                    {gameGenres.map((g) => (
                        <button
                            type="button"
                            key={g}
                            className={`chip ${activeGenres.includes(g) ? "active" : ""}`}
                            disabled={loading}
                            onClick={() => handleGenreToggle(g)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className="controls-right">
                    {activeGenres.length > 1 && (
                        <button
                            className="btn"
                            disabled={loading}
                            onClick={() => setFilterMode((prev) => (prev === "or" ? "and" : "or"))}
                        >
                            {filterMode === "or" ? "하나라도 포함" : "모두 포함"}
                        </button>
                    )}
                    <select
                        value={sortOption}
                        disabled={loading}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                    >
                        <option value="rating-desc">평점 (높은 순)</option>
                        <option value="rating-asc">평점 (낮은 순)</option>
                        <option value="reviews-desc">리뷰 (많은 순)</option>
                        <option value="reviews-asc">리뷰 (적은 순)</option>
                        <option value="name-asc">이름 (가나다순)</option>
                        <option value="name-desc">이름 (역순)</option>
                    </select>
                    <button
                        type="button"
                        className="toggle-wrap"
                        disabled={loading}
                        onClick={() => setLikedOnly((prev) => !prev)}
                    >
                        <span className={`toggle ${likedOnly ? "on" : ""}`}>
                            <span className="knob"></span>
                        </span>
                        찜한 항목만
                    </button>
                </div>
            </div>

            <div className="grid">
                {loading
                    ? Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
                          <div className="card skeleton-card" key={`skeleton-${i}`}>
                              <div className="cover skeleton-block skeleton-animated" />
                              <div className="card-body">
                                  <div className="skeleton-line skeleton-line-title skeleton-animated" />
                                  <div className="skeleton-line skeleton-line-meta skeleton-animated" />
                              </div>
                          </div>
                      ))
                    : visibleGames.map((game) => (
                          <GameCard
                              key={game.id}
                              game={game}
                              rating={averageRating(game.id, reviews)}
                              onSelect={handleSelect}
                              onToggleLike={onToggleLike}
                          />
                      ))}
            </div>
            <DetailModal game={selectedGame} onClose={() => setSelectedId(null)} />
        </>
    );
}

export default GameList;
