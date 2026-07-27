import { useState, useEffect } from 'react';
import type { Game, Review } from './types';
import GameList from './GameList';
import GameForm from './GameForm';
import { Routes, Route, useNavigate, NavLink, Link } from 'react-router-dom';
import BestRanking from './BestRanking';
import { getGames, createGame, updateGame, deleteGame, getAllReviews } from './api';

function App() {
    const [games, setGames] = useState<Game[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getGames()
            .then(setGames)
            .catch((e) => {
                console.error(e);
                alert("게임 목록을 불러오지 못했어요.");
            });
        getAllReviews()
            .then(setReviews)
            .catch((e) => {
                console.error(e);
                alert("리뷰 목록을 불러오지 못했어요.");
            });
    }, []);

    async function handleToggleLike(id: number) {
        const game = games.find((g) => g.id === id);
        if (!game) return;
        try {
            const updated = await updateGame(id, { liked: !game.liked });
            setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
        } catch (e) {
            console.error(e);
            alert("좋아요 상태를 저장하지 못했어요.");
        }
    }

    async function handleSave(id: number | null, data: Omit<Game, "id" | "liked">) {
        try {
            if (id) {
                const updated = await updateGame(id, data);
                setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
            } else {
                const newGame = await createGame(data);
                setGames((prev) => [...prev, newGame]);
            }
            navigate("/");
        } catch (e) {
            console.error(e);
            alert("저장하지 못했어요. 다시 시도해주세요.");
        }
    }

    async function handleDelete(id: number) {
        try {
            await deleteGame(id);
            setGames((prev) => prev.filter((g) => g.id !== id));
            navigate("/");
        } catch (e) {
            console.error(e);
            alert("삭제하지 못했어요. 다시 시도해주세요.");
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