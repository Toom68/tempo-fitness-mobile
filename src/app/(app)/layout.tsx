import { AppNav } from "@/components/shared/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64">
        <div className="mx-auto max-w-5xl safe-top px-4 pt-3 pb-20 md:pt-8 md:px-8 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
