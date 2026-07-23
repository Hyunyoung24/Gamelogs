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
        getGames().then(setGames);
        getAllReviews().then(setReviews);
    }, []);

    async function handleToggleLike(id: number) {
        const game = games.find((g) => g.id === id);
        if (!game) return;
        const updated = await updateGame(id, { liked: !game.liked });
        setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }

    async function handleSave(id: number | null, data: Omit<Game, "id" | "liked">) {
        if (id) {
            const updated = await updateGame(id, data);
            setGames((prev) => prev.map((g) => (g.id === id ? updated : g)));
        } else {
            const newGame = await createGame(data);
            setGames((prev) => [...prev, newGame]);
        }
        navigate("/");
    }

    async function handleDelete(id: number) {
        await deleteGame(id);
        setGames((prev) => prev.filter((g) => g.id !== id));
        navigate("/");
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