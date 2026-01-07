import { Button, Card, Badge } from "@/components/ui/primitives";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Star, Plus, Minus, HelpCircle, Users, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

export function SectionRenderer({ sections }: { sections: any[] }) {
    if (!sections) return null;

    return (
        <div className="flex flex-col">
            {sections.map((section) => (
                <div key={section.id} id={section.type} className="animate-fade-in">
                    {renderSection(section)}
                </div>
            ))}
        </div>
    );
}

function renderSection(section: any) {
    const { type, content } = section;

    switch (type) {
        case 'hero':
            return <HeroSection content={content} />;
        case 'features_grid':
            return <FeaturesGridSection content={content} />;
        case 'logo_cloud':
            return <LogoCloudSection content={content} />;
        case 'split_content':
            return <SplitContentSection content={content} />;
        case 'stats':
            return <StatsSection content={content} />;
        case 'testimonials':
            return <TestimonialsSection content={content} />;
        case 'pricing':
            return <PricingSection content={content} />;
        case 'faq':
            return <FAQSection content={content} />;
        case 'cta_band':
            return <CTASection content={content} />;
        default:
            return (
                <div className="py-20 text-center border bg-muted/20 rounded-xl m-4">
                    <p className="font-mono text-sm text-muted-foreground">Component type "{type}" not found in library</p>
                </div>
            );
    }
}

function HeroSection({ content }: any) {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center text-center">
                    <Badge variant="outline" className="mb-6 px-4 py-1 text-sm font-medium border-primary/20 text-primary bg-primary/5">
                        {content.badge || "Version 4.0 is here"}
                    </Badge>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic">
                        {content.headline}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        {content.subheadline}
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href={content.cta_link || "/register"}>
                            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full shadow-2xl shadow-primary/30 active:scale-95 group">
                                {content.cta_text}
                                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-bold rounded-full border-2 hover:bg-muted/50">
                            Watch Demo
                        </Button>
                    </div>

                    {/* Dashboard Mockup Placeholder */}
                    <div className="mt-20 relative w-full max-w-5xl group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-card rounded-2xl border-4 border-muted/50 overflow-hidden shadow-2xl shadow-primary/10">
                            <img
                                src={content.mockup_url || "https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=2070"}
                                alt="SherPOS Dashboard"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function LogoCloudSection({ content }: any) {
    return (
        <section className="py-12 border-y border-border/50 bg-muted/10">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10">
                    {content.title || "Trusted by global retailers"}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="h-8 font-black text-2xl tracking-tighter">NIKE</div>
                    <div className="h-8 font-black text-2xl tracking-tighter">APPLE</div>
                    <div className="h-8 font-black text-2xl tracking-tighter">ZARA</div>
                    <div className="h-8 font-black text-2xl tracking-tighter">H&M</div>
                    <div className="h-8 font-black text-2xl tracking-tighter">PRADA</div>
                </div>
            </div>
        </section>
    );
}

function FeaturesGridSection({ content }: any) {
    return (
        <section className="py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight italic">
                        {content.title || "Powerful Tools"}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Everything you need to run your business in one unified platform.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {content.items?.map((item: any, i: number) => (
                        <Card key={i} className="p-10 border-2 hover:border-primary/50 transition-all group hover:-translate-y-2 bg-gradient-to-b from-card to-muted/20">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform shadow-inner">
                                <Zap className="fill-primary/20" />
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SplitContentSection({ content }: any) {
    const isReversed = content.image_side === 'right';
    return (
        <section className="py-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className={cn("flex flex-col md:flex-row items-center gap-16 md:gap-24", isReversed && "md:flex-row-reverse")}>
                    <div className="flex-1 space-y-8">
                        <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5">
                            {content.tag || "Innovation"}
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] italic">
                            {content.headline}
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                            {content.body}
                        </p>
                        <ul className="space-y-4">
                            {content.bullets?.map((bullet: string, i: number) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-foreground">
                                    <div className="bg-primary/10 p-1 rounded-full"><CheckCircle2 className="text-primary" size={20} /></div>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                        <div className="pt-4">
                            <Link href="/features">
                                <Button className="h-14 px-8 font-bold rounded-full group">
                                    Learn More
                                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 relative group">
                        <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-[40px] opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative rounded-3xl border-2 border-muted overflow-hidden shadow-2xl">
                            <img
                                src={content.image_url || "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=2070"}
                                alt="Feature Visual"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatsSection({ content }: any) {
    return (
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {content.stats?.map((stat: any, i: number) => (
                        <div key={i} className="space-y-2">
                            <div className="text-5xl md:text-6xl font-black tracking-tighter italic">{stat.value}</div>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-80">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingSection({ content }: any) {
    return (
        <section className="py-32 bg-muted/20">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 italic tracking-tight uppercase">Simple Pricing</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Choose the plan that's right for your business scale.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {content.plans?.map((plan: any, i: number) => (
                        <Card key={i} className={cn("p-10 border-2 relative flex flex-col justify-between", plan.popular && "border-primary shadow-2xl scale-105 z-10")}>
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white font-black px-6">MOST POPULAR</Badge>
                            )}
                            <div>
                                <h3 className="text-2xl font-black mb-2 uppercase italic">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                                    <span className="text-muted-foreground font-bold italic">/mo</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {plan.features?.map((f: string, fi: number) => (
                                        <li key={fi} className="flex items-center gap-3 font-medium text-sm">
                                            <CheckCircle2 className="text-primary shrink-0" size={18} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Button variant={plan.popular ? 'default' : 'outline'} className="w-full h-12 font-bold rounded-xl" asChild>
                                <Link href="/register">Start with {plan.name}</Link>
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TestimonialsSection({ content }: any) {
    return (
        <section className="py-32">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    {content.testimonials?.map((t: any, i: number) => (
                        <div key={i} className="p-8 rounded-3xl bg-muted/30 relative group">
                            <div className="flex gap-1 mb-6 text-primary">
                                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-lg font-bold italic leading-relaxed mb-8 mb-8 line-clamp-4">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-4 border-t border-border pt-6">
                                <div className="w-12 h-12 bg-primary/20 rounded-full shrink-0" />
                                <div>
                                    <div className="font-black italic uppercase text-sm tracking-tight">{t.author}</div>
                                    <div className="text-xs text-muted-foreground font-bold">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQSection({ content }: any) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <section className="py-32 bg-background">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4 italic tracking-tight">FAQS</h2>
                    <p className="text-muted-foreground font-medium">Common questions about SherPOS platform.</p>
                </div>
                <div className="space-y-4">
                    {content.faqs?.map((f: any, i: number) => (
                        <div key={i} className="border-2 border-muted rounded-2xl overflow-hidden group">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-6 text-left flex justify-between items-center bg-muted/5 group-hover:bg-muted/10 transition-colors"
                            >
                                <span className="text-lg font-bold italic uppercase tracking-tight">{f.question}</span>
                                {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                            </button>
                            {openIndex === i && (
                                <div className="p-6 pt-0 bg-muted/5 text-muted-foreground font-medium animate-in slide-in-from-top-2 duration-300">
                                    {f.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTASection({ content }: any) {
    return (
        <section className="py-24 px-4 overflow-hidden relative">
            <div className="max-w-6xl mx-auto">
                <div className="bg-[#0F172A] rounded-[2.5rem] p-16 md:p-24 text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-0" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-7xl font-black mb-6 italic tracking-tight uppercase leading-[1.05]">
                            {content.title || "Next Stop: Commerce Excellence"}
                        </h2>
                        <p className="text-xl text-slate-400 mb-12 font-medium">
                            {content.description || "Stop fighting with legacy systems. Start selling with purpose."}
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/register">
                                <Button className="h-16 px-12 text-lg font-black italic uppercase tracking-tighter rounded-full bg-primary hover:bg-primary/90">
                                    Get Started Now
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" className="h-16 px-12 text-lg font-black italic uppercase tracking-tighter rounded-full border-2 border-white/20 text-white hover:bg-white/10">
                                    Talk to Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
