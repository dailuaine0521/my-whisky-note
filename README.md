# My Whisky Note V1

개인용 위스키 시음/평가 웹앱입니다.

## 포함 기능
- 반응형 데스크탑/모바일 UI
- 위스키 컬렉션 등록
- 보유 / 개봉 / 완병 / 위시리스트 상태 관리
- 구매가 / 예상가 / 숙성연수 / ABV / 캐스크 저장
- 100점 기준 시음 평가
- Nose / Palate / Finish / Balance / Overall
- 시음 노트 여러 회 저장
- 랭킹 / 통계 / 최근 시음
- 브라우저 localStorage 자동 저장
- JSON 내보내기 / 가져오기

## 저장 방식
현재 V1은 브라우저 localStorage에 저장됩니다.
따라서 같은 기기/브라우저에서는 기록이 유지되지만, 휴대폰과 PC 사이 자동 동기화는 아직 지원하지 않습니다.

## 다음 단계
Supabase Auth + PostgreSQL + Storage를 연결해
- 로그인
- 폰/PC 동기화
- 병 이미지 저장
- 클라우드 백업
을 추가할 예정입니다.
