import { AppProvider } from "@/lib/store";
import { Dashboard } from "@/components/dashboardv2/dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Data Private",
    description: "Nouveau tableau de bord indépendant",
};

export default function DashboardV2Page() {
    return (
        <AppProvider>
            <SidebarProvider>
                <Dashboard />
            </SidebarProvider>
        </AppProvider>
    );
}
