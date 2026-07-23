import { useState, useEffect } from "react";
import type { Game, Review } from "./types";
import { getReviews, createReview, deleteReview } from "./api";
import { averageRating } from "./rating";

interface DetailModalProps {
    game: Game | null;
    onClose: () => void;
}

function DetailModal({ game, onClose }: DetailModalProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newContent, setNewContent] = useState("");

    // 열려있는 게임(game.id)이 바뀔 때마다 그 게임의 리뷰를 새로 불러옴
    useEffect(() => {
        if (!game) return;
        getReviews(game.id).then(setReviews);
    }, [game?.id]);

    if (!game) return null;

    const rating = averageRating(game.id, reviews);

    const handleAddReview = async () => {
        if (!newContent.trim()) return;
        const review = await createReview({
            gameId: game.id,
            author: "나",
            rating: newRating,
            content: newContent,
        });
        setReviews((prev) => [...prev, review]);
        setNewContent("");
    };

    const handleDeleteReview = async (id: number) => {
        await deleteReview(id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
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
                    <p className="section-label">리뷰 {reviews.length}개</p>

                    <div id="review-list">
                        {reviews.map((review) => (
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
                        ))}
                    </div>

                    <div className="review-form">
                        <select
                            value={newRating}
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
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleAddReview}>
                            등록
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailModal;