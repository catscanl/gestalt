import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Filter, LogOut, Mail, MessageCircle, Plus, Search, Send, ShieldCheck, Trash2 } from "lucide-react";
import { INITIAL_GESTALTS } from "./data";
import { getSession, onAuthStateChange, signInWithMagicLink, signOut } from "./lib/auth";
import { addComment, createGestalt, deleteGestalt, fetchCollaborator, fetchGestalts, toggleFlag } from "./lib/gestalts";
import { hasSupabaseEnv } from "./lib/supabase";

const EMPTY_GESTALT = {
  phrase: "",
  source: "",
  meaning: "",
  status: "Active",
  flaggedForSlt: false,
};

export default function App() {
  const [gestalts, setGestalts] = useState(INITIAL_GESTALTS);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGestalt, setNewGestalt] = useState(EMPTY_GESTALT);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [session, setSession] = useState(null);
  const [collaborator, setCollaborator] = useState(null);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadSession() {
      try {
        const nextSession = await getSession();
        if (active) {
          setSession(nextSession);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || "Unable to load session.");
          setLoading(false);
        }
      }
    }

    loadSession();

    const { data } = onAuthStateChange((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      return;
    }

    let active = true;

    async function loadAppData() {
      if (!session) {
        if (active) {
          setCollaborator(null);
          setGestalts([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const [rows, member] = await Promise.all([fetchGestalts(), fetchCollaborator()]);

        if (active) {
          setGestalts(rows);
          setCollaborator(member);
          setErrorMessage("");
        }
      } catch (error) {
        if (active) {
          setCollaborator(null);
          setGestalts([]);
          setErrorMessage(error.message || "Unable to load app data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAppData();

    return () => {
      active = false;
    };
  }, [session]);

  const currentRole = collaborator?.role ?? "Guest";
  const canCreateGestalt = !hasSupabaseEnv || currentRole === "Admin" || currentRole === "Contributor";
  const canDeleteGestalt = !hasSupabaseEnv || currentRole === "Admin";
  const canToggleFlag = !hasSupabaseEnv || currentRole === "Admin" || currentRole === "SLT";

  const filteredGestalts = useMemo(
    () =>
      gestalts.filter((gestalt) => {
        const matchesStatus = filterStatus === "All" || gestalt.status === filterStatus;
        const matchesFlag = showFlaggedOnly ? gestalt.flaggedForSlt : true;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          gestalt.phrase.toLowerCase().includes(query) ||
          gestalt.meaning.toLowerCase().includes(query) ||
          gestalt.source.toLowerCase().includes(query);

        return matchesStatus && matchesFlag && matchesSearch;
      }),
    [filterStatus, gestalts, searchQuery, showFlaggedOnly],
  );

  async function handleMagicLink(event) {
    event.preventDefault();

    if (!authEmail.trim()) {
      return;
    }

    try {
      setIsSendingLink(true);
      await signInWithMagicLink(authEmail.trim());
      setMagicLinkSent(true);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to send sign-in link.");
    } finally {
      setIsSendingLink(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setCollaborator(null);
      setSession(null);
      setMagicLinkSent(false);
    } catch (error) {
      setErrorMessage(error.message || "Unable to sign out.");
    }
  }

  async function handleAddGestalt(event) {
    event.preventDefault();
    if (!newGestalt.phrase.trim() || !newGestalt.meaning.trim()) {
      return;
    }

    try {
      const created = await createGestalt(newGestalt);
      setGestalts((current) => [created, ...current]);
      setIsAddModalOpen(false);
      setNewGestalt(EMPTY_GESTALT);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to save gestalt.");
    }
  }

  async function handleDelete(id) {
    if (!canDeleteGestalt) {
      return;
    }

    try {
      await deleteGestalt(id);
      setGestalts((current) => current.filter((gestalt) => gestalt.id !== id));
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete gestalt.");
    }
  }

  async function handleAddComment(gestaltId, commentText) {
    if (!commentText.trim()) {
      return;
    }

    const payload = {
      author: collaborator?.full_name || session?.user?.email || "Unknown",
      text: commentText,
      role: currentRole,
    };

    try {
      const createdComment = await addComment(gestaltId, payload);
      setGestalts((current) =>
        current.map((gestalt) =>
          gestalt.id === gestaltId
            ? { ...gestalt, comments: [...gestalt.comments, createdComment] }
            : gestalt,
        ),
      );
    } catch (error) {
      setErrorMessage(error.message || "Unable to add comment.");
    }
  }

  async function handleToggleFlag(id) {
    if (!canToggleFlag) {
      return;
    }

    const target = gestalts.find((gestalt) => gestalt.id === id);
    if (!target) {
      return;
    }

    const nextFlaggedValue = !target.flaggedForSlt;
    setGestalts((current) =>
      current.map((gestalt) =>
        gestalt.id === id ? { ...gestalt, flaggedForSlt: nextFlaggedValue } : gestalt,
      ),
    );

    try {
      await toggleFlag(id, nextFlaggedValue);
    } catch (error) {
      setGestalts((current) =>
        current.map((gestalt) =>
          gestalt.id === id ? { ...gestalt, flaggedForSlt: target.flaggedForSlt } : gestalt,
        ),
      );
      setErrorMessage(error.message || "Unable to update flag.");
    }
  }

  if (!hasSupabaseEnv) {
    return (
      <Shell>
        <Header
          subtitle="Supabase is not configured, so the app is running in local demo mode."
          title="Gestalt Tracker"
        />
        <Banner tone="info">Add Supabase environment variables to enable authentication and live data.</Banner>
        <GestaltDashboard
          canCreateGestalt
          canDeleteGestalt
          canToggleFlag
          currentRoleLabel="Demo mode"
          filteredGestalts={filteredGestalts}
          filterStatus={filterStatus}
          gestalts={gestalts}
          isAddModalOpen={isAddModalOpen}
          loading={loading}
          newGestalt={newGestalt}
          searchQuery={searchQuery}
          setFilterStatus={setFilterStatus}
          setIsAddModalOpen={setIsAddModalOpen}
          setNewGestalt={setNewGestalt}
          setSearchQuery={setSearchQuery}
          setShowFlaggedOnly={setShowFlaggedOnly}
          showFlaggedOnly={showFlaggedOnly}
          onAddComment={handleAddComment}
          onAddGestalt={handleAddGestalt}
          onDelete={handleDelete}
          onToggleFlag={handleToggleFlag}
        />
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <Header
          subtitle="Secure sign-in with Supabase magic links."
          title="Gestalt Tracker"
        />
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500">Use an approved email address to receive a magic link.</p>
            </div>
          </div>

          {errorMessage && <Banner tone="error">{errorMessage}</Banner>}
          {magicLinkSent && (
            <Banner tone="success">
              Check your email for the sign-in link, then come back to this tab.
            </Banner>
          )}

          <form className="space-y-4" onSubmit={handleMagicLink}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-300 px-3 py-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  autoFocus
                  className="w-full border-0 p-0 outline-none"
                  placeholder="you@example.com"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSendingLink}
              type="submit"
            >
              {isSendingLink ? "Sending link..." : "Email me a sign-in link"}
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  if (!loading && !collaborator) {
    return (
      <Shell>
        <Header
          subtitle="You are signed in, but this email has not been granted access yet."
          title="Gestalt Tracker"
        />
        {errorMessage && <Banner tone="error">{errorMessage}</Banner>}
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-950 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">Access not granted</h2>
          <p className="mb-4 text-sm">
            Add <strong>{session.user.email}</strong> to the `collaborators` table in Supabase, then refresh.
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header
        rightSlot={
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        }
        subtitle={session.user.email}
        title="Gestalt Tracker"
      />

      {errorMessage && <Banner tone="error">{errorMessage}</Banner>}

      <GestaltDashboard
        canCreateGestalt={canCreateGestalt}
        canDeleteGestalt={canDeleteGestalt}
        canToggleFlag={canToggleFlag}
        currentRoleLabel={`${collaborator.full_name} · ${collaborator.role}`}
        filteredGestalts={filteredGestalts}
        filterStatus={filterStatus}
        gestalts={gestalts}
        isAddModalOpen={isAddModalOpen}
        loading={loading}
        newGestalt={newGestalt}
        searchQuery={searchQuery}
        setFilterStatus={setFilterStatus}
        setIsAddModalOpen={setIsAddModalOpen}
        setNewGestalt={setNewGestalt}
        setSearchQuery={setSearchQuery}
        setShowFlaggedOnly={setShowFlaggedOnly}
        showFlaggedOnly={showFlaggedOnly}
        onAddComment={handleAddComment}
        onAddGestalt={handleAddGestalt}
        onDelete={handleDelete}
        onToggleFlag={handleToggleFlag}
      />
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] pb-20 text-slate-900">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">{children}</main>
    </div>
  );
}

function Header({ title, subtitle, rightSlot = null }) {
  return (
    <header className="sticky top-0 z-10 rounded-3xl border border-white/60 bg-white/85 px-5 py-4 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {rightSlot}
      </div>
    </header>
  );
}

function Banner({ children, tone }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-indigo-200 bg-indigo-50 text-indigo-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]}`}>{children}</div>;
}

function GestaltDashboard({
  canCreateGestalt,
  canDeleteGestalt,
  canToggleFlag,
  currentRoleLabel,
  filteredGestalts,
  filterStatus,
  isAddModalOpen,
  loading,
  newGestalt,
  searchQuery,
  setFilterStatus,
  setIsAddModalOpen,
  setNewGestalt,
  setSearchQuery,
  setShowFlaggedOnly,
  showFlaggedOnly,
  onAddComment,
  onAddGestalt,
  onDelete,
  onToggleFlag,
}) {
  return (
    <>
      <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current access</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{currentRoleLabel}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-2xl border border-white/70 bg-white px-10 py-3 shadow-sm outline-none ring-indigo-500 transition focus:ring-2"
            placeholder="Search phrases, meanings, or sources..."
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {canCreateGestalt && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99]"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-5 w-5" />
            Add Gestalt
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="hidden h-4 w-4 text-slate-400 sm:block" />
        {["All", "Active", "Fading", "Archived"].map((status) => (
          <button
            key={status}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filterStatus === status
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => setFilterStatus(status)}
            type="button"
          >
            {status}
          </button>
        ))}

        <button
          className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
            showFlaggedOnly
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
          onClick={() => setShowFlaggedOnly((current) => !current)}
          type="button"
        >
          <AlertCircle className="h-4 w-4" />
          Flagged for SLT
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-slate-500 shadow-sm">
            Loading gestalts...
          </div>
        ) : filteredGestalts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <h3 className="font-medium text-slate-900">No gestalts found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or adding a new one.</p>
          </div>
        ) : (
          filteredGestalts.map((gestalt) => (
            <GestaltCard
              key={gestalt.id}
              canDeleteGestalt={canDeleteGestalt}
              canToggleFlag={canToggleFlag}
              gestalt={gestalt}
              onAddComment={onAddComment}
              onDelete={onDelete}
              onToggleFlag={onToggleFlag}
            />
          ))
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Log New Gestalt</h2>
              <button
                className="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                &times;
              </button>
            </div>

            <form className="space-y-4 overflow-y-auto p-6" onSubmit={onAddGestalt}>
              <Field
                autoFocus
                label="The Phrase *"
                placeholder='e.g., "Merry Christmas"'
                value={newGestalt.phrase}
                onChange={(value) => setNewGestalt((current) => ({ ...current, phrase: value }))}
              />

              <Field
                label="Observed Meaning *"
                placeholder="What is he trying to communicate?"
                value={newGestalt.meaning}
                onChange={(value) => setNewGestalt((current) => ({ ...current, meaning: value }))}
              />

              <Field
                label="Original Source (Optional)"
                placeholder="e.g., Peppa Pig, a song, etc."
                value={newGestalt.source}
                onChange={(value) => setNewGestalt((current) => ({ ...current, source: value }))}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-500 transition focus:ring-2"
                  value={newGestalt.status}
                  onChange={(event) =>
                    setNewGestalt((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Fading">Fading</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm font-medium text-orange-800 transition hover:bg-orange-100">
                <input
                  checked={newGestalt.flaggedForSlt}
                  type="checkbox"
                  onChange={(event) =>
                    setNewGestalt((current) => ({
                      ...current,
                      flaggedForSlt: event.target.checked,
                    }))
                  }
                />
                <AlertCircle className="h-4 w-4" />
                Flag for SLT review
              </label>

              <div className="flex gap-3 pt-3">
                <button
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
                  onClick={() => setIsAddModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
                  type="submit"
                >
                  Save Gestalt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ autoFocus = false, label, onChange, placeholder, value }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-indigo-500 transition focus:ring-2"
        placeholder={placeholder}
        required={label.includes("*")}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function GestaltCard({
  canDeleteGestalt,
  canToggleFlag,
  gestalt,
  onAddComment,
  onDelete,
  onToggleFlag,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");

  async function handleCommentSubmit(event) {
    event.preventDefault();
    await onAddComment(gestalt.id, newComment);
    setNewComment("");
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
        gestalt.flaggedForSlt
          ? "border-orange-300 ring-1 ring-orange-100"
          : "border-slate-200 hover:border-indigo-200"
      }`}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h3 className="break-words text-lg font-bold leading-tight text-slate-900">
                "{gestalt.phrase}"
              </h3>
              {gestalt.flaggedForSlt && (
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700">
                  Needs Review
                </span>
              )}
            </div>
            <p className="mb-2 flex items-start gap-2 break-words text-sm font-medium text-slate-600">
              <span className="mt-0.5 shrink-0">↳</span>
              <span>{gestalt.meaning}</span>
            </p>
            {gestalt.source && <p className="text-xs text-slate-400">Source: {gestalt.source}</p>}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
            <StatusBadge status={gestalt.status} />

            {canDeleteGestalt && (
              <button
                className="p-2 text-slate-400 transition hover:text-red-500"
                onClick={() => onDelete(gestalt.id)}
                title="Delete"
                type="button"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
        <button
          className="flex items-center gap-1.5 py-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          <MessageCircle className="h-4 w-4" />
          {gestalt.comments.length} {gestalt.comments.length === 1 ? "Observation" : "Observations"}
        </button>

        {canToggleFlag && (
          <button
            className={`flex items-center gap-1.5 py-1 text-sm font-medium transition ${
              gestalt.flaggedForSlt
                ? "text-orange-600 hover:text-orange-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => onToggleFlag(gestalt.id)}
            type="button"
          >
            <AlertCircle className="h-4 w-4" />
            {gestalt.flaggedForSlt ? "Flagged" : "Flag for SLT"}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-white p-5">
          <div className="mb-4 space-y-4">
            {gestalt.comments.length === 0 ? (
              <p className="text-center text-sm italic text-slate-400">No observations yet.</p>
            ) : (
              gestalt.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-sm">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      comment.role === "Admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : comment.role === "SLT"
                          ? "bg-teal-100 text-teal-700"
                          : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-none border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-800">{comment.author}</span>
                      <span className="text-xs text-slate-400">{comment.time}</span>
                    </div>
                    <p className="text-slate-600">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="flex gap-2" onSubmit={handleCommentSubmit}>
            <input
              className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-3 py-3 text-sm outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="Add an observation..."
              type="text"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
            />
            <button
              className="flex shrink-0 items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!newComment.trim()}
              type="submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Fading: "border-amber-200 bg-amber-50 text-amber-700",
    Archived: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>{status}</span>;
}
