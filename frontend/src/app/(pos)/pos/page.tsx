export default function POSPage() {
    return (
        <div className="flex flex-1 h-full font-sans">
            {/* Left: Product Grid */}
            <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
                <header className="flex justify-between items-center mb-4">
                    <input type="text" placeholder="Search products..." className="w-full max-w-md p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <a href="/app/dashboard" className="text-gray-500 hover:text-gray-800 ml-4">Exit POS</a>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition select-none active:scale-95">
                            <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
                            <div className="font-bold text-gray-800">Product {i}</div>
                            <div className="text-blue-600 font-semibold">$10.00</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 bg-white shadow-2xl flex flex-col border-l border-gray-200">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Current Order</h2>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* Empty State */}
                    <div className="text-center text-gray-400 mt-10">
                        Cart is empty
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2">
                        <span>Total</span>
                        <span>$0.00</span>
                    </div>
                </div>
                <div className="p-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}
