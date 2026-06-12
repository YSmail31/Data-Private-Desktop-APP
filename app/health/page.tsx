'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Server, Database, Globe, Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HealthPage() {
    const [status, setStatus] = useState({
        frontend: 'healthy',
        backend: 'checking',
        database: 'checking',
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                // Use a relative path so it works through the proxy
                const response = await fetch('/api/v1/health')
                if (response.ok) {
                    const data = await response.json()
                    setStatus(prev => ({
                        ...prev,
                        backend: data.status === 'healthy' ? 'healthy' : 'unhealthy',
                        database: data.database === 'connected' ? 'healthy' : 'unhealthy'
                    }))
                } else {
                    setStatus(prev => ({ ...prev, backend: 'unhealthy', database: 'unhealthy' }))
                }
            } catch (error) {
                console.error('Health check failed:', error)
                setStatus(prev => ({ ...prev, backend: 'unhealthy', database: 'unhealthy' }))
            } finally {
                setLoading(false)
            }
        }

        checkHealth()
    }, [])

    const isAllHealthy = status.frontend === 'healthy' && status.backend === 'healthy' && status.database === 'healthy'

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary/20">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] opacity-50" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_85%)] opacity-[0.03]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 mb-6"
                    >
                        <Zap className={cn("w-3.5 h-3.5", isAllHealthy ? "text-emerald-500" : "text-amber-500")} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">System Monitoring</span>
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {loading ? "Checking Systems..." : isAllHealthy ? "Operational" : "Partial Outage"}
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Real-time status of the Data Private infrastructure.
                    </p>
                </div>

                <div className="space-y-4">
                    <StatusCard
                        icon={<Globe className="w-5 h-5" />}
                        label="Frontend Edge"
                        description="Static Content Delivery"
                        status={status.frontend}
                        loading={false}
                        index={0}
                    />
                    <StatusCard
                        icon={<Server className="w-5 h-5" />}
                        label="API Core"
                        description="FastAPI Production Cluster"
                        status={status.backend}
                        loading={loading}
                        index={1}
                    />
                    <StatusCard
                        icon={<Database className="w-5 h-5" />}
                        label="Storage Layer"
                        description="Relational Database Service"
                        status={status.database}
                        loading={loading}
                        index={2}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest"
                >
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AWS Region: EU-WEST-3
                    </div>
                    <span>Refreshed: {new Date().toLocaleTimeString()}</span>
                </motion.div>
            </motion.div>

            {/* Hidden for machine health checks - ALB only sees 200 OK from the static file server */}
            <div className="sr-only" aria-hidden="true">
                HEALTH_STATUS: {isAllHealthy ? "OK" : "CHECKING"}
            </div>
        </div>
    )
}

function StatusCard({ icon, label, description, status, loading, index }: any) {
    const isHealthy = status === 'healthy'

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.1) }}
            className={cn(
                "group p-5 rounded-[1.25rem] border transition-all duration-500 flex items-center gap-5 bg-card/50 backdrop-blur-sm",
                isHealthy ? "border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]" :
                    loading ? "border-border hover:border-primary/20" :
                        "border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/[0.02]"
            )}
        >
            <div className={cn(
                "p-3 rounded-2xl border transition-colors duration-500 flex items-center justify-center",
                isHealthy ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 group-hover:scale-110" :
                    loading ? "bg-muted border-border text-muted-foreground" :
                        "bg-rose-500/5 border-rose-500/10 text-rose-500 group-hover:scale-110"
            )}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-sm leading-none mb-1.5 tracking-tight group-hover:translate-x-1 transition-transform">{label}</h3>
                <p className="text-[11px] text-muted-foreground/70 font-medium">{description}</p>
            </div>
            <div className="flex items-center justify-center w-6 h-6">
                {loading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
                ) : isHealthy ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
            </div>
        </motion.div>
    )
}
