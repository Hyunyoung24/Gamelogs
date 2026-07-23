import { Link } from "react-router-dom";
import type { Game } from "./types";

interface GameCardProps {
  game: Game;
  rating: number;
  onSelect: (id: number) => void;
  onToggleLike: (id: number) => void;
}

function GameCard({ game, rating, onSelect, onToggleLike }: GameCardProps) {
  return (
    <div className="card" onClick={() => onSelect(game.id)}>
      <div className="cover">
        <div
          className="cover-image"
          style={{ backgroundImage: `url('${game.image}')` }}
        />
        <span className="genre-tag">{game.genre.join(" · ")}</span>
      </div>
      <div className="card-body">
        <p className="card-title">{game.title}</p>
        <div className="card-meta">
          <span className="rating">
            {rating === 0 ? "리뷰 없음" : `★ ${rating.toFixed(1)}`}
          </span>
          <span className="card-icons">
            <Link
                to={`/edit/${game.id}`}
                className="icon-btn"
                onClick={(e) => e.stopPropagation()}
            >
                ✎
            </Link>
            <button
              className={`icon-btn ${game.liked ? "liked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(game.id);
              }}
            >
              ♥
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default GameCard;