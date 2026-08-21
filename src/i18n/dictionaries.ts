export type Locale = "ko" | "ja";

export const locales: Locale[] = ["ko", "ja"];
export const defaultLocale: Locale = "ko";

export const dictionaries: Record<Locale, Record<string, string>> = {
  ko: {
    "home.title": "우리만의 엽서",
    "home.subtitle": "누구인가요?",
    "home.selectMin": "Min",
    "home.selectMomoka": "Momoka",
    "nav.write": "엽서 쓰기",
    "nav.inbox": "수신함",
    "nav.archive": "타임라인",
    "pin.prompt": "PIN 4자리를 입력하세요",
    "pin.submit": "확인",
    "pin.back": "뒤로가기",
    "pin.error": "PIN이 일치하지 않습니다",
    "location.useCurrent": "현재 위치 사용",
    "location.locating": "위치 확인 중...",
    "location.manualPlaceholder": "예: Sinbong 1-ro 110, Suji-gu, Yongin",
    "location.submit": "위치 찾기",
    "location.notFound": "주소를 찾을 수 없어요. 다시 입력해주세요.",
    "location.enterManually": "직접 입력하기",
  },
  ja: {
    "home.title": "ふたりのポストカード",
    "home.subtitle": "だれですか?",
    "home.selectMin": "Min",
    "home.selectMomoka": "Momoka",
    "nav.write": "ポストカードを書く",
    "nav.inbox": "受信箱",
    "nav.archive": "タイムライン",
    "pin.prompt": "4桁のPINを入力してください",
    "pin.submit": "確認",
    "pin.back": "戻る",
    "pin.error": "PINが一致しません",
    "location.useCurrent": "現在地を使う",
    "location.locating": "位置情報を取得中...",
    "location.manualPlaceholder": "例: Sinbong 1-ro 110, Suji-gu, Yongin",
    "location.submit": "位置を検索",
    "location.notFound": "住所が見つかりません。もう一度入力してください。",
    "location.enterManually": "手動で入力する",
  },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? key;
}
