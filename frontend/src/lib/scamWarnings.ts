// Non-blocking phrase check for chat. Flags messages that push payment or
// contact outside Suqly. It warns the user; it never blocks a message.
const RISKY_PATTERNS: RegExp[] = [
  /western\s*union|moneygram|remitly/i,
  /gift\s*cards?|google\s*play\s*card|itunes\s*card/i,
  /advance\s+(payment|deposit|fee)|pay\s+(the\s+)?deposit\s+first|deposit\s+first/i,
  /send\s+(me\s+)?(the\s+)?money|bank\s+transfer\s+first|transfer\s+first/i,
  /crypto|bitcoin|usdt|binance/i,
  /courier\s+fee|shipping\s+fee\s+first|agent\s+fee|insurance\s+fee/i,
  /(contact|message|chat|talk)\s+(me\s+)?(on|via|at)\s+(telegram|signal|wechat)/i,
  /outside\s+(the\s+)?(app|suqly|platform)|off[\s-]?platform/i,
  /ارسل\s*المال|تحويل\s*مسبق|عربون\s*أولا|بطاقة\s*هدايا/,
];

export function findRiskyPhrases(text: string): string[] {
  if (!text) return [];
  return RISKY_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}
