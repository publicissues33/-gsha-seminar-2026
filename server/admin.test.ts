import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  createRegistration: vi.fn().mockResolvedValue({}),
  listRegistrations: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "測試用戶",
      company: "測試公司",
      title: "工程師",
      phone: "0912345678",
      email: "test@example.com",
      createdAt: new Date("2026-08-06T10:00:00Z"),
    },
  ]),
  countRegistrations: vi.fn().mockResolvedValue(1),
  countTodayRegistrations: vi.fn().mockResolvedValue(1),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue({}),
}));

function makeCtx(role: "admin" | "user" | null): TrpcContext {
  const user =
    role === null
      ? null
      : {
          id: 1,
          openId: "test-open-id",
          email: "admin@example.com",
          name: "Test Admin",
          loginMethod: "google",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("registration.list (admin only)", () => {
  it("returns list for admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.registration.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    expect(result[0]?.name).toBe("測試用戶");
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.registration.list({})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("throws FORBIDDEN for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.registration.list({})).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("registration.stats (admin only)", () => {
  it("returns stats for admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.registration.stats();
    expect(result).toMatchObject({ total: 1, today: 1 });
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.registration.stats()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

describe("settings.getRegistrationStatus (public)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns registrationClosed: false when both settings are null", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValue(null);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationStatus();
    expect(result.registrationClosed).toBe(false);
  });

  it("returns registrationClosed: true when manual closed is 'true'", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationClosed") return "true";
      return null;
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationStatus();
    expect(result.registrationClosed).toBe(true);
    expect(result.manualClosed).toBe(true);
  });

  it("returns registrationClosed: true when deadline has passed", async () => {
    const { getSetting } = await import("./db");
    // 設定截止日期為過去的日期
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationDeadline") return "2020-01-01";
      return null;
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationStatus();
    expect(result.registrationClosed).toBe(true);
  });

  it("returns registrationClosed: false when deadline is in the future", async () => {
    const { getSetting } = await import("./db");
    // 設定截止日期為未來的日期
    vi.mocked(getSetting).mockImplementation(async (key: string) => {
      if (key === "registrationDeadline") return "2099-12-31";
      return null;
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationStatus();
    expect(result.registrationClosed).toBe(false);
  });

  it("is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.settings.getRegistrationStatus()).resolves.toBeDefined();
  });
});

describe("settings.setRegistrationClosed (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to set registrationClosed to true", async () => {
    const { setSetting } = await import("./db");
    vi.mocked(setSetting).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.setRegistrationClosed({ closed: true });
    expect(result).toMatchObject({ success: true, registrationClosed: true });
    expect(setSetting).toHaveBeenCalledWith("registrationClosed", "true");
  });

  it("allows admin to set registrationClosed to false", async () => {
    const { setSetting } = await import("./db");
    vi.mocked(setSetting).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.setRegistrationClosed({ closed: false });
    expect(result).toMatchObject({ success: true, registrationClosed: false });
    expect(setSetting).toHaveBeenCalledWith("registrationClosed", "false");
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.settings.setRegistrationClosed({ closed: true })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.settings.setRegistrationClosed({ closed: true })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("settings.getRegistrationDeadline (public)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns deadline: null when not set", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValueOnce(null);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationDeadline();
    expect(result).toMatchObject({ deadline: null });
  });

  it("returns the stored deadline value", async () => {
    const { getSetting } = await import("./db");
    vi.mocked(getSetting).mockResolvedValueOnce("2026-08-02");

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.settings.getRegistrationDeadline();
    expect(result).toMatchObject({ deadline: "2026-08-02" });
  });

  it("is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.settings.getRegistrationDeadline()).resolves.toBeDefined();
  });
});

describe("settings.setRegistrationDeadline (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to set deadline", async () => {
    const { setSetting } = await import("./db");
    vi.mocked(setSetting).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.setRegistrationDeadline({ deadline: "2026-08-02" });
    expect(result).toMatchObject({ success: true, deadline: "2026-08-02" });
    expect(setSetting).toHaveBeenCalledWith("registrationDeadline", "2026-08-02");
  });

  it("allows admin to clear deadline (null)", async () => {
    const { setSetting } = await import("./db");
    vi.mocked(setSetting).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.setRegistrationDeadline({ deadline: null });
    expect(result).toMatchObject({ success: true, deadline: null });
    expect(setSetting).toHaveBeenCalledWith("registrationDeadline", "");
  });

  it("rejects invalid date format", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.settings.setRegistrationDeadline({ deadline: "2026/08/02" })
    ).rejects.toThrow();
  });

  it("throws FORBIDDEN for non-admin user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.settings.setRegistrationDeadline({ deadline: "2026-08-02" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws FORBIDDEN for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.settings.setRegistrationDeadline({ deadline: "2026-08-02" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
