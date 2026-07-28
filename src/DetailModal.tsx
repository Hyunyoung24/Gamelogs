import { useState, useEffect, useRef } from "react";
import type { Game, Review } from "./types";
import { getReviews, createReview, deleteReview } from "./api";
import { averageRating } from "./rating";
import { reportError } from "./errors";

interface DetailModalProps {
    game: Game | null;
    onClose: () => void;
}

function DetailModal({ game, onClose }: DetailModalProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newContent, setNewContent] = useState("");
    // 마지막으로 리뷰를 성공적으로 불러온 게임 id. 같은 게임을 닫았다가 다시 열 때
    // 불필요하게 다시 불러오면서 깜빡이는 걸 막기 위해 기록해둔다.
    const loadedGameIdRef = useRef<number | null>(null);

    // 열려있는 게임(game.id)이 바뀔 때마다 그 게임의 리뷰를 새로 불러옴
    useEffect(() => {
        // early return 분기에도 명시적으로 빈 클린업을 반환해서, 이후 코드가 바뀌어도
        // "이 effect는 클린업이 있다/없다"가 한눈에 드러나게 한다.
        if (!game) return () => {};
        if (loadedGameIdRef.current === game.id) return () => {};
        // 새 게임의 리뷰가 도착하기 전까지 이전 게임의 리뷰가 잠깐 남아있는 걸 방지
        setReviews([]);
        setReviewsLoading(true);
        // 게임을 빠르게 연속 전환하면 이전 요청 응답이 늦게 도착해 최신 상태를 덮어쓸 수 있다.
        // cancelled 플래그로 이 effect가 이미 무효화됐으면(=클린업 실행됨) 응답을 무시한다.
        let cancelled = false;
        getReviews(game.id)
            .then((data) => {
                if (!cancelled) {
                    setReviews(data);
                    loadedGameIdRef.current = game.id;
                }
            })
            .catch((e) => {
                if (!cancelled) reportError(e, "리뷰를 불러오지 못했어요.");
            })
            .finally(() => {
                if (!cancelled) setReviewsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [game?.id]);

    if (!game) return null;

    const rating = averageRating(game.id, reviews);

    const handleAddReview = async () => {
        if (!newContent.trim()) return;
        try {
            const review = await createReview({
                gameId: game.id,
                author: "나",
                rating: newRating,
                content: newContent,
            });
            setReviews((prev) => [...prev, review]);
            setNewContent("");
        } catch (e) {
            reportError(e, "리뷰를 등록하지 못했어요.");
        }
    };

    const handleDeleteReview = async (id: number) => {
        try {
            await deleteReview(id);
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } catch (e) {
            reportError(e, "리뷰를 삭제하지 못했어요.");
        }
    };

    return (
        <div
            className="modal-overlay open"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal">
                <div className="modal-cover">
                    <img
                        src={game.image}
                        alt={game.title}
                        className="modal-cover-img"
                    />
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <p className="modal-title">{game.title}</p>
                    <p className="modal-meta">
                        {game.genre.join(" · ")} / {game.platform} / {" "}
                        <span className="rating">{rating === 0 ? "리뷰 없음" : `★ ${rating.toFixed(1)}`}</span>
                    </p>
                    <p className="modal-desc">{game.description}</p>

                    <hr className="divider" />
                    <p className="section-label">
                        {reviewsLoading ? "리뷰 불러오는 중..." : `리뷰 ${reviews.length}개`}
                    </p>

                    <div id="review-list">
                        {reviewsLoading ? (
                            <p className="review-loading">잠시만 기다려주세요...</p>
                        ) : (
                            reviews.map((review) => (
                                <div className="review" key={review.id}>
                                    <div>
                                        <span className="review-author">{review.author}</span>
                                        <span className="review-stars">
                                            {"★".repeat(review.rating)}
                                        </span>
                                        <div className="review-text">{review.content}</div>
                                    </div>
                                    <button
                                        className="review-del"
                                        onClick={() => handleDeleteReview(review.id)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="review-form">
                        <select
                            value={newRating}
                            disabled={reviewsLoading}
                            onChange={(e) => setNewRating(Number(e.target.value))}
                        >
                            <option value={5}>★5</option>
                            <option value={4}>★4</option>
                            <option value={3}>★3</option>
                            <option value={2}>★2</option>
                            <option value={1}>★1</option>
                        </select>
                        <input
                            type="text"
                            placeholder="리뷰를 남겨보세요"
                            value={newContent}
                            disabled={reviewsLoading}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <button
                            className="btn btn-primary"
                            disabled={reviewsLoading}
                            onClick={handleAddReview}
                        >
                            등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailModal;
