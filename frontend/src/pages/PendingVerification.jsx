import { useAuth } from "../context/AuthContext";

function PendingVerification() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-amber-100 text-5xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    ⏳
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Awaiting Admin Approval
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    Your officer account has been created successfully. An admin needs to
                    verify your account before you can access the Officer Dashboard.
                </p>

                {/* Officer details */}
                {user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left space-y-2">
                        <DetailRow label="Name" value={user.name} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Department" value={user.department || "—"} />
                        <DetailRow
                            label="Status"
                            value={
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                    ⏳ Pending Verification
                                </span>
                            }
                        />
                    </div>
                )}

                {/* Info note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-xs text-blue-700 text-left">
                    📬 <strong>What happens next?</strong> The admin will review your
                    registration. Once approved, log in again and you'll be taken directly
                    to the Officer Dashboard.
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors"
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-400 w-24 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-gray-700 text-right">{typeof value === "string" ? value : value}</span>
        </div>
    );
}

export default PendingVerification;
