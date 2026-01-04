export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                The POS system for <span className="text-blue-600">modern commerce</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-10">
                SherPOS unifies your online and offline sales in one beautiful, reliable SaaS platform.
            </p>
            <div className="flex gap-4">
                <a href="/pricing" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">View Pricing</a>
                <a href="/features" className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Learn More</a>
            </div>
        </div>
    );
}
