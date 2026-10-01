# GameLog

플레이한 게임을 등록하고, 별점과 리뷰를 남기고, 좋아요(찜)와 베스트 랭킹까지 볼 수 있는 게임 리뷰 웹앱

- 프론트: https://gamelogs-web.onrender.com
- 백엔드 API: https://gamelogs-3pj0.onrender.com

## 주요 기능
- 게임 목록: 다중 장르 필터(하나라도 포함 / 모두 포함 토글), 찜한 항목만 보기, 평점·리뷰수·이름순 정렬
- 좋아요(찜) 토글: 클릭 즉시 서버에 PATCH로 저장
- 상세 모달: 리뷰 작성/삭제, 실제 리뷰 평균으로 평점 실시간 계산
- 게임 등록/수정: 다중 장르 선택, 커버 이미지는 파일명만 입력하거나 외부 URL 직접 입력 가능
- 베스트 랭킹: 평점/리뷰수/찜 순 정렬, 커버 이미지가 왼쪽에서 페이드아웃되는 배경 처리
- 로딩 중 스켈레톤 UI + 무료 호스팅 콜드스타트 안내 문구
- API 실패 시 토스트 알림

## 작동 방식
1. React SPA가 마운트되면 `App.tsx`에서 게임 목록과 전체 리뷰를 한 번에 불러옴 (`Promise.allSettled`)
2. 모든 API 호출은 `api.ts`를 거치는데, `fetch`는 4xx/5xx여도 reject하지 않기 때문에 `parseResponse`/`assertOk`로 감싸서 실패를 명시적으로 던지게 함
3. 평점은 DB에 저장하지 않고, 게임에 달린 리뷰들의 평균을 그때그때 계산함 (`rating.ts`의 `averageRating`)
4. 백엔드는 `json-server`를 그대로 쓰지 않고 `server.js`로 한 번 감싸서, 배포 환경이 지정하는 `PORT` 환경변수를 읽도록 구성
5. 에러가 나면 `errors.ts`의 `reportError`가 커스텀 이벤트(`toastBus.ts`)를 쏘고, `Toast.tsx`가 이를 구독해서 화면 하단에 알림을 띄움
6. 프론트는 Render Static Site, 백엔드는 Render Web Service(Node)로 각각 배포하고, `.env.production`의 `VITE_API_URL`로 프론트가 백엔드 주소를 찾아감

## 기술 스택

| 영역 | 기술 | 이유 |
|------|------|------|
| 프론트 | React 19 + TypeScript + Vite | 컴포넌트 기반 UI, 빠른 개발 서버/빌드 |
| 라우팅 | React Router v7 | 목록/상세/등록/베스트 화면 간 SPA 라우팅 |
| 백엔드 | json-server | 짧은 기간 안에 실제 파일 기반(REST + 영속성) API를 구현하기 위함 |
| 배포(프론트) | Render Static Site | 빌드 산출물(`dist`)을 정적으로 서빙, 콜드스타트 없음 |
| 배포(백엔드) | Render Web Service (Node) | `server.js`로 json-server를 프로그래밍적으로 구동 |

### json-server를 선택한 이유
- 백엔드를 처음부터 구현할 시간 없이, 실제 CRUD와 PATCH 영속성이 되는 API가 필요했음
- `db.json` 파일 하나로 데이터 구조를 바로 확인/수정할 수 있어 개발 중 디버깅이 쉬움
- 다만 무료 배포 환경(Render Free)에서는 컨테이너가 재시작될 때마다 파일 시스템이 초기화될 수 있어, 실제 서비스라면 별도 DB로 옮겨야 함

## 트러블슈팅

### Vite에서 이미지가 안 뜨던 문제
- `src/images/`에 이미지를 넣고 문자열 경로로 참조했더니 빌드에 포함되지 않아 전부 깨짐
- Vite는 `src/` 아래 파일은 `import`해야 번들에 포함하고, 문자열 경로로 쓰려면 `public/`에 둬야 한다는 걸 뒤늦게 파악. `public/images/`로 옮기고 절대경로(`/images/파일명.jpg`)로 통일해서 해결

### fetch가 실패해도 조용히 성공한 것처럼 처리되던 문제
- `res.json()`은 응답이 404/500이어도 reject하지 않고 에러 응답 본문을 그대로 파싱해버려서, 실패한 요청이 성공한 것처럼 넘어감
- `parseResponse`/`assertOk` 헬퍼로 `res.ok`를 먼저 확인하고, 실패하면 상태 코드와 응답 본문을 담아 명시적으로 에러를 던지도록 변경

  ```ts
  export async function parseResponse<T>(res: Response): Promise<T> {
      if (!res.ok) {
          throw await createApiError(res);
      }
      return (await res.json()) as T;
  }
  ```

### 리뷰 id 중복으로 React key 경고
- `db.json`에 리뷰를 수동으로 추가하다가 서로 다른 리뷰 두 개가 같은 `id`를 갖게 되어 `Encountered two children with the same key` 경고 발생
- 중복된 id를 다음 사용 가능한 번호로 재부여해서 해결. 이후로는 리뷰 추가 시 id 중복 여부를 스크립트로 한 번씩 확인

### DetailModal에서 게임을 빠르게 전환할 때 생기는 경쟁 상태
- 게임 A를 열고 바로 게임 B로 전환하면, A의 리뷰 응답이 B보다 늦게 도착해 B의 리뷰 화면에 A의 데이터가 잠깐 덮어써지는 문제
- `useEffect` 안에서 `cancelled` 플래그를 두고, 클린업에서 이를 `true`로 바꿔 이미 무효화된 요청의 응답은 무시하도록 처리

### 무료 배포 환경의 콜드스타트
- Render 무료 웹서비스는 일정 시간 요청이 없으면 슬립 상태로 들어가고, 다시 깨어나는 데 30초~1분 정도 걸림(길면 그 이상)
- 처음엔 GitHub Actions로 주기적으로 핑을 보내 깨워두는 방식을 시도했으나, private 저장소는 Actions 무료 실행 시간(월 2,000분)을 금방 초과할 수 있어 포기
- 대신 로딩 중에는 스켈레톤 UI와 함께 "서버 준비 중입니다" 안내 문구를 보여줘서, 느린 게 아니라 원래 이런 구조라는 걸 사용자가 알 수 있게 함

### Vercel 배포 도중 계정 인증 실패
- 프론트를 Vercel에 배포하려던 중 `Authentication failed` 에러로 계정 자체에 접근이 안 되는 상황 발생
- 원인 파악에 시간을 쓰는 대신, 이미 정상 동작 중이던 Render 계정으로 프론트도 함께 배포(Static Site)하는 쪽으로 방향을 바꿔 해결

## 사용법

### 사전 준비
- Node.js 20 이상

### 로컬 실행
```bash
# 1. 의존성 설치
npm install

# 2. 백엔드(json-server) 실행 — 기본 포트 3000
npm start

# 3. (다른 터미널) 프론트엔드 개발 서버 실행
npm run dev
```

기본적으로 프론트는 `http://localhost:3000`의 백엔드를 바라봅니다. 배포 환경에서는 `.env.production`의 `VITE_API_URL`을 통해 실제 백엔드 주소를 사용합니다.

```bash
# .env.production
VITE_API_URL=https://gamelogs-3pj0.onrender.com
```

### 빌드
```bash
npm run build
```
`tsc -b && vite build`가 실행되며, 결과물은 `dist/`에 생성됩니다.

## 추후 계획
- ~~다중 장르 지원 및 OR/AND 필터~~
- ~~평점을 저장값이 아닌 리뷰 기반 계산값으로 전환~~
- ~~API 에러 처리 및 사용자 알림(토스트) 체계화~~
- **접근성 보강**: 이미지 alt, 폼 label 연결, 남은 인터랙티브 요소들의 키보드 접근성 정리
- **`api.ts` 내부 정리**: 테스트 전용으로 열어둔 `export`를 정리하는 마무리 작업
- **검색 기능**: 목록 화면에 제목 검색 인풋 추가
- **필터/정렬 상태 URL 동기화**: 새로고침해도 필터가 유지되도록
