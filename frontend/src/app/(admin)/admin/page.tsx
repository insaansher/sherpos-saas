export default function AdminPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">System Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Active Tenants</h3>
                    <p className="text-3xl font-bold text-white">42</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-slate-400 text-sm font-medium mb-1">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white">$45,200</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-bold text-white mb-4">Recent Registrations</h2>
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-slate-400 border-b border-slate-700">
                                <th className="pb-3 pl-2">Tenant Name</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            <tr>
                                <td className="py-3 pl-2">Coffee House 1</td>
                                <td className="py-3"><span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs">Active</span></td>
                                <td className="py-3">Jan 02, 2026</td>
                            </tr>
                            <tr>
                                <td className="py-3 pl-2">Retail Store X</td>
                                <td className="py-3"><span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded text-xs">Pending</span></td>
                                <td className="py-3">Jan 01, 2026</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
