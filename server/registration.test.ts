import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db and notification modules
vi.mock("./db", () => ({
  createRegistration: vi.fn().mockResolvedValue(undefined),
  listRegistrations: vi.fn().mockResolvedValue([]),
  countRegistrations: vi.fn().mockResolvedValue(0),
  countTodayRegistrations: vi.fn().mockResolvedValue(0),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("registration.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully submits a valid registration", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.submit({
      name: "王小明",
      company: "智森永續設計",
      title: "方案總監",
      phone: "0912345678",
      email: "test@example.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.submit({
        name: "王小明",
        company: "智森永續設計",
        title: "方案總監",
        phone: "0912345678",
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });

  it("rejects empty required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.submit({
        name: "",
        company: "智森永續設計",
        title: "方案總監",
        phone: "0912345678",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects submission when registration is closed (backend guard)", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValueOnce("true");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.submit({
        name: "王小明",
        company: "智森永續設計",
        title: "方案總監",
        phone: "0912345678",
        email: "test@example.com",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows submission when registration is open", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValueOnce("false");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.submit({
      name: "王小明",
      company: "智森永續設計",
      title: "方案總監",
      phone: "0912345678",
      email: "test@example.com",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("registration.submit - deadline auto-close", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects submission when deadline has passed", async () => {
    const { getSetting } = await import("./db");
    // 手動未關閉，但截止日期已過
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationClosed") return "false";
      if (key === "registrationDeadline") return "2020-01-01";
      return null;
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.submit({
        name: "王小明",
        company: "智森永續設計",
        title: "方案總監",
        phone: "0912345678",
        email: "test@example.com",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows submission when deadline is in the future", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationClosed") return "false";
      if (key === "registrationDeadline") return "2099-12-31";
      return null;
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.registration.submit({
      name: "王小明",
      company: "智森永續設計",
      title: "方案總監",
      phone: "0912345678",
      email: "test@example.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects when both manual closed and past deadline", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationClosed") return "true";
      if (key === "registrationDeadline") return "2020-01-01";
      return null;
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.registration.submit({
        name: "王小明",
        company: "智森永續設計",
        title: "方案總監",
        phone: "0912345678",
        email: "test@example.com",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("settings - clear deadline consistency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getRegistrationDeadline returns null when deadline is empty string", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValueOnce("");

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.settings.getRegistrationDeadline();
    expect(result).toMatchObject({ deadline: null });
  });

  it("getRegistrationStatus returns not closed when deadline is cleared", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationClosed") return "false";
      if (key === "registrationDeadline") return "";
      return null;
    });

    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.settings.getRegistrationStatus();
    expect(result.registrationClosed).toBe(false);
    expect(result.deadline).toBeNull();
  });
});

describe("registration.list", () => {
  it("allows admin to list registrations", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.registration.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const ctx: TrpcContext = {
      ...createPublicContext(),
      user: {
        id: 2,
        openId: "regular-user",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.registration.list()).rejects.toThrow();
  });
});
