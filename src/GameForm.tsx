import { useState } from "react";
import type { Game } from "./types";
import { genres } from "./types";
import { useParams, Link } from "react-router-dom";

interface GameFormProps {
    games: Game[];
    onSave: (id: number | null, data: Omit<Game, "id" | "liked">) => void;
    onDelete: (id: number) => void;
}

function GameForm({ games, onSave, onDelete }: GameFormProps) {
    const { id } = useParams<{ id: string }>();
    // id가 있으면(수정 모드) games에서 찾고, 없으면(등록 모드) null
    const game = id ? games.find((g) => g.id === Number(id)) ?? null : null;
    // 폼 필드 5개 useState로 선언
    const [title, setTitle ] = useState(game?.title ?? "");
    const [genre, setGenre] = useState<string[]>(game?.genre ?? []);
    const [platform, setPlatform ] = useState(game?.platform ?? "");
    const [image, setImage] = useState(
        game?.image?.replace(/^\/images\//, "").replace(/\.jpg$/, "") ?? ""
    );
    const [description, setDescription ] = useState(game?.description ?? "");

    // 삭제 확인 모달 표시 여부 state
    const [confirmOpen, setConfirmOpen] = useState(false);

    // 클릭한 장르가 이미 배열에 있으면 빼고 없으면 넣는 함수
    const handleGenreToggle = (g: string) => {
        setGenre((prev) =>
            prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
        );
    };

    // 저장 버튼 눌렀을 때 실행할 함수
    const handleSave = () => {
        onSave(game?.id ?? null, {
            title,
            genre,
            platform,
            image: image.trim() ? `/images/${image.trim()}.jpg` : "",
            description,
        });
    };


    return (
        <div>
        <h1 className="page-title">{game ? "게임 정보 수정" : "새 게임 등록"}</h1>
        <p className="page-sub">{game ? "기존 항목의 정보를 수정해요." : "항목을 새로 추가해요."}</p>
        <div className="form-card">
            <div className="field">
                <label>제목</label>
                <input
                    type="text"
                    placeholder="게임 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="field-row">
                <div className="field">
                    <label>장르</label>
                    <div className="chips">
                        {genres.map((g) => (
                            <span
                                key={g}
                                className={`chip ${genre.includes(g) ? "active" : ""}`}
                                onClick={() => handleGenreToggle(g)}
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="field">
                    <label>플랫폼</label>
                    <input
                        type="text"
                        placeholder="플랫폼"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                    />
                </div>
            </div>
            <div className="field">
                <label>커버 이미지 파일명 (확장자 생략)</label>
                <input
                    type="text"
                    placeholder="예: pinball"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />
            </div>
            <div className="field">
                <label>한 줄 소개</label>
                <textarea 
                    rows={3} 
                    placeholder="게임 설명"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="form-actions">
                {game && (
                    <button 
                        className="btn btn-danger" 
                        onClick={() => setConfirmOpen(true)}
                    >
                        삭제
                    </button>
                )}
                <div className="right">
                    <Link className="btn" to="/">취소</Link>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave}
                    >
                        저장
                    </button>
                </div>
            </div>

            {confirmOpen && (
                <div className="modal-overlay open">
                    <div className="modal confirm-box">
                        <p className="title">이 게임을 삭제할까요?</p>
                        <p className="sub">되돌릴 수 없어요.</p>
                        <div className="confirm-actions">
                            <button 
                                className="btn" 
                                onClick={() => setConfirmOpen(false)}
                            >
                                취소
                            </button>
                            <button 
                                className="btn btn-danger"
                                onClick={() => game && onDelete(game.id)}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

export default GameForm;