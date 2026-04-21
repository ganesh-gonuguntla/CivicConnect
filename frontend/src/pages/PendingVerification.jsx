import { useAuth } from "../context/AuthContext";

function PendingVerification() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-orange-500/10 pointer-events-none"></div>
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 mb-8 text-center">
                    <div className="text-5xl mb-3">⏳</div>
                    <h1 className="text-2xl font-bold text-white">
                        Account Under Review
                    </h1>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-8 text-center">
                    Your officer account has been created successfully. An administrator will verify your credentials shortly.
                </p>

                {/* Officer details */}
                {user && (
                    <div className="bg-slate-50 rounded-xl p-5 mb-8 space-y-4 border border-slate-200">
                        <DetailRow label="Name" value={user.name} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Department" value={user.department || "—"} />
                        <DetailRow
                            label="Status"
                            value={
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">
                                    ⏳ Pending Verification
                                </span>
                            }
                        />
                    </div>
                )}

                {/* Info note */}
                <div className="bg-violet-50 border-l-4 border-violet-500 rounded-lg p-4 mb-8 text-sm text-slate-700">
                    <p className="font-semibold mb-2">📬 What Happens Next?</p>
                    <p className="text-slate-600 text-sm">
                        Our admin team will review your information. Once approved, simply sign in again and you'll access the Officer Dashboard.
                    </p>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 last:border-0 last:pb-0">
            <span className="text-xs font-semibold text-slate-500 w-24 shrink-0">{label}</span>
            <span className="text-sm font-medium text-slate-700 text-right">{typeof value === "string" ? value : value}</span>
        </div>
    );
}

export default PendingVerification;
