export interface Game {
  id: number;
  title: string;
  genre: string[];
  platform: string;
  image: string;
  description: string;
  liked: boolean;
}

export interface Review {
  id: number;
  gameId: number;
  author: string;
  rating: number;
  content: string;
}

export const genres = [
  "RPG", 
  "FPS", 
  "TPS", 
  "AOS", 
  "액션", 
  "슈팅", 
  "캐주얼", 
  "어드벤처", 
  "샌드박스", 
  "오픈월드",
  "전략", 
  "시뮬레이션", 
  "스포츠", 
  "생존", 
  "배틀로얄", 
  "호러", 
  "비행",
  "운전",
  "레이싱", 
  "퍼즐", 
  "카드/보드게임",  
  "건설",
  "리듬"
];
