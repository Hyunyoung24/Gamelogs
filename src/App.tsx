import { useState, useEffect } from 'react';
import type { Game, Review } from './types';
import GameList from './GameList';
import GameForm from './GameForm';
import { Routes, Route, useNavigate, NavLink, Link } from 'react-router-dom';
import BestRanking from './BestRanking';
import { getGames, createGame, updateGame, deleteGame, getAllReviews } from './api';
import { reportError } from './errors';

function App() {
    const [games, setGames] = useState<Game[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 두 요청을 개별 catch로 처리하면 둘 다 실패했을 때 alert가 연달아 두 번 뜬다.
        // allSettled로 묶어서 실패한 것만 모아 한 번에 알린다.
        Promise.allSettled([getGames(), getAllReviews()])
            .then(([gamesResult, reviewsResult]) => {
                const failed: string[] = [];
                if (gamesResult.status === "fulfilled") {
                    setGames(gamesResult.value);
                } else {
                    console.error(gamesResult.reason);
                    failed.push("게임 목록");
                }
                if (reviewsResult.status === "fulfilled") {
                    setReviews(reviewsResult.value);
                } else {
                    console.error(reviewsResult.reason);
                    failed.push("리뷰 목록");
                }
                if (failed.length > 0) {
                    // 개별 원인은 위에서 이미 console.error로 남겼으니, 여기선 null을 넘기고 메시지만 통합해서 알린다.
                    reportError(null, `${failed.join(", ")}을 불러오지 못했어요.`);
                }
            })
            // allSettled는 항상 resolve되니 지금은 .then만으로도 충분하지만,
            // 나중에 로직이 바뀌어도 loading이 영원히 true로 남지 않도록 finally로 안전하게 처리한다.
            .finally(() => setLoading(false));
    }, []);

    // 실패하면 원래 값을 그대로 유지한다(낙관적 업데이트가 아님).
    // 낙관적 업데이트로 바꾸게 되면 이 catch 블록에서 이전 상태로 되돌리는 롤백 로직이 필요하다.
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
                  <Route path="/" element={<GameList games={games} reviews={reviews} loading={loading} onToggleLike={handleToggleLike} />} />
                  <Route path="/best" element={<BestRanking games={games} reviews={reviews} loading={loading} />} />
                  <Route path="/new" element={<GameForm games={games} onSave={handleSave} onDelete={handleDelete} />} />
                  <Route path="/edit/:id" element={<GameForm games={games} onSave={handleSave} onDelete={handleDelete} />} />
              </Routes>
          </main>
      </>
  );
}

export default App;
