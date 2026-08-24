// คำนวณต้นทุนต่อกรัม
export function calcCostPerGram(price: number, weight: number): number {
  if (weight <= 0) return 0;
  return price / weight;
}

// คำนวณน้ำรวมจาก pours
export function calcTotalWater(pourGrams: number[]): number {
  return pourGrams.reduce((sum, g) => sum + g, 0);
}

// คำนวณ ratio
export function calcRatio(water: number, coffee: number): number {
  if (coffee <= 0) return 0;
  return water / coffee;
}

// เช็คสถานะสต็อก
export function getStockStatus(weight: number, isFinished: boolean): "out" | "low" | "ok" {
  if (isFinished || weight <= 0) return "out";
  if (weight < 50) return "low";
  return "ok";
}

// แปลงวินาทีเป็น mm:ss
export function secondsToDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type FreshnessLevel = "resting" | "peak" | "good" | "stale";

export function daysSinceRoast(roastDate: Date | string): number {
  const roast = new Date(roastDate);
  const now = new Date();
  const diff = now.getTime() - roast.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getFreshness(roastDate: Date | string): FreshnessLevel {
  const days = daysSinceRoast(roastDate);
  if (days <= 3) return "resting";
  if (days <= 14) return "peak";
  if (days < 35) return "good";
  return "stale";
}