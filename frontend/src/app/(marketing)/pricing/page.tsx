export default function PricingPage() {
    return (
        <div className="max-w-6xl mx-auto py-20 px-4">
            <h1 className="text-4xl font-bold mb-10 text-center">Simple Pricing</h1>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { name: "Starter", price: "$29" },
                    { name: "Growth", price: "$79" },
                    { name: "Enterprise", price: "Custom" }
                ].map((plan) => (
                    <div key={plan.name} className="p-8 border rounded-2xl flex flex-col items-center hover:border-blue-500 transition-colors">
                        <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                        <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-base font-normal text-gray-500">/mo</span></div>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Choose Plan</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
