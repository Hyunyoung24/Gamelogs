import { useState, useEffect } from 'react';
import type { Game, Review } from './types';
import GameList from './GameList';
import GameForm from './GameForm';
import { Routes, Route, useNavigate, NavLink, Link } from 'react-router-dom';
import BestRanking from './BestRanking';
import { getGames, createGame, updateGame, deleteGame, getAllReviews } from './api';

// API 호출 실패를 콘솔에 남기고 사용자에게 알린다.
// TODO: alert()는 브라우저 UI를 막는 방식이라 UX상 아쉬움. 프로젝트가 커지면 토스트 컴포넌트로 교체할 것.
function reportError(e: unknown, message: string) {
    console.error(e);
    alert(message);
}

function App() {
    const [games, setGames] = useState<Game[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getGames()
            .then(setGames)
            .catch((e) => reportError(e, "게임 목록을 불러오지 못했어요."));
        getAllReviews()
            .then(setReviews)
            .catch((e) => reportError(e, "리뷰 목록을 불러오지 못했어요."));
    }, []);

    async function handleToggleLike(id: number) {
        const game = games.find((g) => g.id === id);
        if (!game) return;
        try {
            const updated = await updateGame(id, { liked: !game.liked });
            setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
        } catch (e) {
            reportError(e, "좋아요 상태를 저장하지 못했어요.");
        }
    }

    async function handleSave(id: number | null, data: Omit<Game, "id" | "liked">) {
        try {
            if (id !== null) {
                const updated = await updateGame(id, data);
                setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
            } else {
                const newGame = await createGame(data);
                setGames((prev) => [...prev, newGame]);
            }
            navigate("/");
        } catch (e) {
            reportError(e, "저장하지 못했어요. 다시 시도해주세요.");
        }
    }

    async function handleDelete(id: number) {
        try {
            await deleteGame(id);
            setGames((prev) => prev.filter((g) => g.id !== id));
            navigate("/");
        } catch (e) {
            reportError(e, "삭제하지 못했어요. 다시 시도해주세요.");
        }
    }

    return (
      <>
          <header>
              <div className="header-inner">
                  <div className="logo"><span>●</span><Link to="/">GameLog</Link></div>
                  <nav className="tabs">
                      <NavLink to="/" end className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}>목록</NavLink>
                      <NavLink to="/best" className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}>베스트</NavLink>
                      <NavLink to="/new" className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}>새 게임 등록</NavLink>
                  </nav>
              </div>
          </header>
          <main>
              <Routes>
                  <Route path="/" element={<GameList games={games} reviews={reviews} onToggleLike={handleToggleLike} />} />
                  <Route path="/best" element={<BestRanking games={games} reviews={reviews} />} />
                  <Route path="/new" element={<GameForm games={games} onSave={handleSave} onDelete={handleDelete} />} />
                  <Route path="/edit/:id" element={<GameForm games={games} onSave={handleSave} onDelete={handleDelete} />} />
              </Routes>
          </main>
      </>
  );
}

export default App;