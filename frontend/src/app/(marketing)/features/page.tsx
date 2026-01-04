export default function FeaturesPage() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-4">
            <h1 className="text-4xl font-bold mb-10 text-center">Powerful Features</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {[
                    "Real-time Inventory", "Multi-store Support", "Analytics Dashboard", "Customer CRM"
                ].map((feature) => (
                    <div key={feature} className="p-6 border rounded-xl hover:shadow-lg transition">
                        <h3 className="text-xl font-bold mb-2">{feature}</h3>
                        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
