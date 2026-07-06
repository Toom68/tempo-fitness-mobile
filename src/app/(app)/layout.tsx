import { AppNav } from "@/components/shared/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64">
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-[max(env(safe-area-inset-top),0.75rem)] md:px-8 md:pb-6 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
