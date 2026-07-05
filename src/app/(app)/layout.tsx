import { AppNav } from "@/components/shared/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="md:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 pt-20 md:pt-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
