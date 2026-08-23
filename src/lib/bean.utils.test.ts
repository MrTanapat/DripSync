import { describe, it, expect } from "vitest";
import {
  calcCostPerGram,
  calcTotalWater,
  calcRatio,
  getStockStatus,
  secondsToDisplay,
} from "./bean.utils";

describe("calcCostPerGram", () => {
  it("returns correct cost per gram", () => {
    expect(calcCostPerGram(500, 250)).toBe(2);
  });

  it("returns 0 when weight is 0", () => {
    expect(calcCostPerGram(500, 0)).toBe(0);
  });

  it("handles decimal values correctly", () => {
    expect(calcCostPerGram(450, 200)).toBeCloseTo(2.25);
  });
});

describe("calcTotalWater", () => {
  it("sums water from multiple pours", () => {
    expect(calcTotalWater([50, 100, 150])).toBe(300);
  });

  it("returns 0 when no pours provided", () => {
    expect(calcTotalWater([])).toBe(0);
  });

  it("works with a single pour", () => {
    expect(calcTotalWater([165])).toBe(165);
  });
});

describe("calcRatio", () => {
  it("calculates brew ratio correctly", () => {
    expect(calcRatio(300, 20)).toBe(15);
  });

  it("returns 0 when coffee dose is 0 without throwing", () => {
    expect(calcRatio(300, 0)).toBe(0);
  });
});

describe("getStockStatus", () => {
  it("returns ok when weight is above 50g and not finished", () => {
    expect(getStockStatus(250, false)).toBe("ok");
  });

  it("returns low when weight is below 50g", () => {
    expect(getStockStatus(30, false)).toBe("low");
  });

  it("returns out when isFinished is true", () => {
    expect(getStockStatus(100, true)).toBe("out");
  });

  it("returns out when weight is 0", () => {
    expect(getStockStatus(0, false)).toBe("out");
  });
});

describe("secondsToDisplay", () => {
  it("converts 90 seconds to 1:30", () => {
    expect(secondsToDisplay(90)).toBe("1:30");
  });

  it("pads single-digit seconds with leading zero", () => {
    expect(secondsToDisplay(65)).toBe("1:05");
  });

  it("returns 0:00 for zero seconds", () => {
    expect(secondsToDisplay(0)).toBe("0:00");
  });

  it("converts 180 seconds to 3:00", () => {
    expect(secondsToDisplay(180)).toBe("3:00");
  });
});