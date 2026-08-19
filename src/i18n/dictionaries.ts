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
  },
  ja: {
    "home.title": "ふたりのポストカード",
    "home.subtitle": "だれですか?",
    "home.selectMin": "Min",
    "home.selectMomoka": "Momoka",
    "nav.write": "ポストカードを書く",
    "nav.inbox": "受信箱",
    "nav.archive": "タイムライン",
  },
};

export function t(locale: Locale, key: string): string {
  return dictionaries[locale][key] ?? key;
}
