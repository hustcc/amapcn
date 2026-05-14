import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { DocsSidebar, MobileSidebarTrigger } from "./_components/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col w-full">
        <Header
          className="sticky top-0 z-50 bg-background/95 border-b backdrop-blur supports-backdrop-filter:bg-background/60"
          leftContent={<MobileSidebarTrigger />}
        />
        <div className="flex flex-1 container">
          <DocsSidebar />
          <main className="flex-1 w-full">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
