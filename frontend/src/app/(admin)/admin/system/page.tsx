"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button } from "@/components/ui/primitives";
import { Activity, Server, Database, Globe, Cpu, HardDrive, CheckCircle2, Zap } from "lucide-react";

export default function SystemHealthPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                <p className="text-muted-foreground">Infrastructure status, latency, and resource utilization.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Activity className="text-green-600" size={24} />
                        <div className="space-y-1">
                            <CardTitle className="text-base text-green-700 dark:text-green-400">All Systems Operational</CardTitle>
                            <CardDescription className="text-green-600/80 dark:text-green-500/80">99.99% Uptime (30d)</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg API Latency</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48ms</div>
                        <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[20%]"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Error Rate (5xx)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0.02%</div>
                        <div className="h-1 w-full bg-muted mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[1%]"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-lg font-semibold mt-6">Component Status</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatusCard name="Primary Database (Postgres)" icon={Database} status="healthy" details="CPU: 12% | Conn: 45/100" />
                <StatusCard name="Cache Layer (Redis)" icon={HardDrive} status="healthy" details="Memory: 1.2GB / 4GB" />
                <StatusCard name="API Gateway" icon={Globe} status="healthy" details="Region: us-east-1" />
                <StatusCard name="Job Queue (Worker)" icon={Cpu} status="cautious" details="Backlog: 45 jobs (High)" />
                <StatusCard name="Storage (S3)" icon={Server} status="healthy" details="Usage: 45TB" />
                <StatusCard name="Edge Functions" icon={Zap} status="healthy" details="Invocations: 1.2M/hr" />
            </div>
        </div>
    );
}

function StatusCard({ name, icon: Icon, status, details }: any) {
    const color = status === 'healthy' ? 'bg-green-500' : status === 'cautious' ? 'bg-yellow-500' : 'bg-red-500';
    return (
        <Card className="flex items-center p-4 gap-4">
            <div className={`p-2 rounded-lg bg-muted`}>
                <Icon size={20} className="text-foreground" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{name}</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${color}`}></span>
                        <span className="text-xs uppercase text-muted-foreground font-semibold">{status}</span>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">{details}</div>
            </div>
        </Card>
    )
}
