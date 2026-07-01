import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Users,
  CalendarCheck,
  Download,
  Search,
  LogIn,
  ShieldAlert,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  BanIcon,
  CheckCircle2,
  CalendarClock,
  X,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";

// ── CSV export helper ──────────────────────────────────────────────────────────
function exportCSV(rows: Registration[]) {
  const header = ["姓名", "公司", "職稱", "電話", "Email", "報名時間"];
  const body = rows.map(r => [
    r.name,
    r.company,
    r.title,
    r.phone,
    r.email,
    new Date(r.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
  ]);
  const csv = [header, ...body]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `報名名單_環境醫生研討會_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Registration = {
  id: number;
  name: string;
  company: string;
  title: string;
  phone: string;
  email: string;
  createdAt: Date;
};

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Registration closed toggle card ───────────────────────────────────────────
function RegistrationClosedCard() {
  const utils = trpc.useUtils();

  const { data: statusData, isLoading: statusLoading } =
    trpc.settings.getRegistrationStatus.useQuery();

  const setClosedMutation = trpc.settings.setRegistrationClosed.useMutation({
    onSuccess: (data) => {
      utils.settings.getRegistrationStatus.invalidate();
      if (data.registrationClosed) {
        toast.error("報名已截止", {
          description: "前台報名表單已替換為「報名已截止」提示訊息。",
        });
      } else {
        toast.success("報名已開放", {
          description: "前台報名表單已恢復正常，訪客可再次報名。",
        });
      }
    },
    onError: () => {
      toast.error("操作失敗", { description: "請稍後再試。" });
    },
  });

  const isClosed = statusData?.registrationClosed ?? false;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between gap-4 transition-colors ${
        isClosed ? "border-red-200 bg-red-50/30" : "border-gray-100"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isClosed ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          {isClosed ? (
            <BanIcon className="w-6 h-6 text-white" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">截止報名開關</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {statusLoading
              ? "載入中..."
              : isClosed
              ? "目前狀態：報名已截止（前台顯示截止提示）"
              : "目前狀態：報名開放中（前台顯示報名表單）"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-medium ${isClosed ? "text-red-600" : "text-emerald-700"}`}>
          {isClosed ? "已截止" : "開放中"}
        </span>
        <Switch
          checked={isClosed}
          disabled={statusLoading || setClosedMutation.isPending}
          onCheckedChange={(checked) => {
            setClosedMutation.mutate({ closed: checked });
          }}
          className={isClosed ? "data-[state=checked]:bg-red-500" : ""}
        />
      </div>
    </div>
  );
}

// ── Registration deadline card ────────────────────────────────────────────────
function RegistrationDeadlineCard() {
  const utils = trpc.useUtils();
  const [inputDate, setInputDate] = useState("");
  const [editing, setEditing] = useState(false);

  const { data: deadlineData, isLoading: deadlineLoading } =
    trpc.settings.getRegistrationDeadline.useQuery();

  const currentDeadlineInit = deadlineData?.deadline ?? null;

  // 初始化 inputDate：當資料載入後同步設定（僅在非編輯狀態下）
  // 清除截止日期後（deadline 為 null）同步清空 inputDate
  useEffect(() => {
    if (!editing) {
      setInputDate(currentDeadlineInit ?? "");
    }
  }, [currentDeadlineInit]);

  const setDeadlineMutation = trpc.settings.setRegistrationDeadline.useMutation({
    onSuccess: (data) => {
      utils.settings.getRegistrationDeadline.invalidate();
      utils.settings.getRegistrationStatus.invalidate();
      if (data.deadline) {
        const display = new Date(`${data.deadline}T00:00:00+08:00`).toLocaleDateString("zh-TW", {
          year: "numeric", month: "long", day: "numeric",
        });
        toast.success(`截止日期已設定為 ${display}`);
      } else {
        toast.success("截止日期已清除");
      }
      setEditing(false);
    },
    onError: () => {
      toast.error("設定失敗，請稍後再試。");
    },
  });

  // 顯示用：格式化為中文日期
  const currentDeadline = currentDeadlineInit;
  const displayDeadline = currentDeadline
    ? new Date(`${currentDeadline}T00:00:00+08:00`).toLocaleDateString("zh-TW", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  // 是否已過截止日期
  const isPast = currentDeadline
    ? Date.now() > new Date(`${currentDeadline}T23:59:59+08:00`).getTime()
    : false;

  const handleSave = () => {
    if (!inputDate) {
      setDeadlineMutation.mutate({ deadline: null });
    } else {
      setDeadlineMutation.mutate({ deadline: inputDate });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-600">
          <CalendarClock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">自動截止日期</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {deadlineLoading
              ? "載入中..."
              : currentDeadline
              ? isPast
                ? `截止日期：${displayDeadline}（已過期，報名自動關閉）`
                : `截止日期：${displayDeadline}（到期後自動關閉報名）`
              : "尚未設定截止日期"}
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => {
              setInputDate(currentDeadline ?? "");
              setEditing(true);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0"
          >
            {currentDeadline ? "修改" : "設定"}
          </button>
        )}
      </div>

      {editing && (
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            style={{ color: "var(--text-dark, #1a1a1a)" }}
          />
          <button
            onClick={handleSave}
            disabled={setDeadlineMutation.isPending}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {setDeadlineMutation.isPending ? "儲存中..." : "儲存"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          {currentDeadline && (
            <button
              onClick={() => setDeadlineMutation.mutate({ deadline: null })}
              disabled={setDeadlineMutation.isPending}
              className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
            >
              清除
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Admin() {
  const { user, loading, refresh } = useAuth();
  const [search, setSearch] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("登入成功");
      await refresh();
    },
    onError: (err) => {
      toast.error(`登入失敗：${err.message}`);
    },
  });

  const { data: registrations, isLoading: listLoading } = trpc.registration.list.useQuery(
    { search: search || undefined },
    { enabled: user?.role === "admin" }
  );

  const { data: stats, isLoading: statsLoading } = trpc.registration.stats.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const deleteMutation = trpc.registration.delete.useMutation({
    onSuccess: () => {
      utils.registration.list.invalidate();
      utils.registration.stats.invalidate();
      utils.settings.getRegistrationStatus.invalidate();
      toast.success("報名資料已刪除");
    },
    onError: (err) => {
      toast.error(`刪除失敗：${err.message}`);
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`確定要刪除 ${name} 的報名資料嗎？此動作無法復原。`)) {
      deleteMutation.mutate({ id });
    }
  };

  // ── Auth guard ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton className="w-64 h-8" />
      </div>
    );
  }

  if (!user) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!loginUsername.trim()) {
        toast.error("請輸入帳號");
        return;
      }
      if (!loginPassword.trim()) {
        toast.error("請輸入密碼");
        return;
      }
      loginMutation.mutate({ username: loginUsername, password: loginPassword });
    };

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 max-w-sm w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2">
              <LogIn className="w-8 h-8 text-emerald-700" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">管理員登入</h1>
            <p className="text-gray-500 text-sm">請輸入帳號與密碼以存取報名名單管理後台</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">帳號</label>
              <Input
                type="text"
                placeholder="請輸入管理員帳號"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full text-base"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">密碼</label>
              <Input
                type="password"
                placeholder="請輸入密碼"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors mt-2"
            >
              {loginMutation.isPending ? "登入中..." : "登入"}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-sm text-emerald-700 hover:underline">
              ← 返回活動頁面
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">無存取權限</h1>
          <p className="text-gray-500 text-sm">
            您的帳號（{user.name}）沒有管理員權限，請聯繫主辦方開通。
          </p>
          <Link href="/" className="text-sm text-emerald-700 hover:underline">
            ← 返回活動頁面
          </Link>
        </div>
      </div>
    );
  }

  // ── Admin view ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-emerald-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">報名名單管理</h1>
              <p className="text-xs text-gray-400">環境醫生實務研討會 · 2026/8/6</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-500">{user.name}</span>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              管理員
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                label="總報名人數"
                value={stats?.total ?? 0}
                color="bg-emerald-600"
              />
              <StatCard
                icon={CalendarCheck}
                label="今日新增"
                value={stats?.today ?? 0}
                color="bg-teal-500"
              />
            </>
          )}
        </div>

        {/* Email config warning alert */}
        {!statsLoading && stats && !stats.smtpConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
            <span className="text-base shrink-0">⚠️</span>
            <div>
              <p className="font-semibold mb-0.5">系統提醒：尚未啟用「正式 Email 發信功能」</p>
              <p className="text-amber-700 leading-relaxed">
                目前伺服器沒有偵測到發信相關環境變數，系統正處於「模擬寄信」狀態（只會寫入後台日誌，報名者不會收到真實郵件）。
                若要啟用真實郵件通知，請至 Render 平台設定以下 5 個環境變數：
                <code className="mx-1 px-1 bg-amber-100 rounded text-xs font-mono font-semibold">SMTP_HOST</code>、
                <code className="mx-1 px-1 bg-amber-100 rounded text-xs font-mono font-semibold">SMTP_PORT</code>、
                <code className="mx-1 px-1 bg-amber-100 rounded text-xs font-mono font-semibold">SMTP_USER</code>、
                <code className="mx-1 px-1 bg-amber-100 rounded text-xs font-mono font-semibold">SMTP_PASS</code>、
                <code className="mx-1 px-1 bg-amber-100 rounded text-xs font-mono font-semibold">SMTP_FROM</code>。
              </p>
            </div>
          </div>
        )}

        {/* Registration closed toggle */}
        <RegistrationClosedCard />

        {/* Registration deadline */}
        <RegistrationDeadlineCard />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜尋姓名、公司、Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 focus:border-emerald-400"
            />
          </div>
          <Button
            onClick={() => registrations && exportCSV(registrations as Registration[])}
            disabled={!registrations || registrations.length === 0}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            匯出 CSV（{registrations?.length ?? 0} 筆）
          </Button>
        </div>

        {/* Table – desktop */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600 w-8">#</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">姓名</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">公司</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">職稱</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">電話</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">報名時間</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-600 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : registrations && registrations.length > 0 ? (
                (registrations as Registration[]).map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-emerald-50/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{r.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.company}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.title}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{r.phone}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{r.email}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString("zh-TW", {
                        timeZone: "Asia/Taipei",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r.id, r.name)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>{search ? "找不到符合的報名者" : "尚無報名資料"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards – mobile */}
        <div className="md:hidden space-y-3">
          {listLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))
          ) : registrations && registrations.length > 0 ? (
            (registrations as Registration[]).map((r, idx) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-gray-400 font-mono mr-2">#{idx + 1}</span>
                    <span className="font-bold text-gray-800 text-base">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString("zh-TW", {
                        timeZone: "Asia/Taipei",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(r.id, r.name)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-7 w-7"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{r.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{r.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="font-mono text-xs">{r.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs truncate">{r.email}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? "找不到符合的報名者" : "尚無報名資料"}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
