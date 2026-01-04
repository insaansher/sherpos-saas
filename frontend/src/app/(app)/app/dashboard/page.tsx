export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Total Sales</h3>
                    <p className="text-3xl font-bold text-gray-900">$12,450</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Orders</h3>
                    <p className="text-3xl font-bold text-gray-900">345</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Low Stock Items</h3>
                    <p className="text-3xl font-bold text-red-600">12</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                <div className="text-gray-500 text-sm">No recent activity</div>
            </div>
        </div>
    );
}
