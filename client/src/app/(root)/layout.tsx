import DesktopNav from "@/components/sidebars/DesktopNav";
import MobileNav from "@/components/sidebars/MobileNav";

// Layout Component that wraps around all routes inside route group 'root'
// it ensures a consistent layout for all routes within the route group 'root'
// this Layout component will be given to the Root Layout component as a child
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-hidden p-4 lg:flex-row">
      {/* seperating these two is more readable */}
      <DesktopNav />
      <MobileNav />

      <main className="flex h-[calc(100%-80px)] w-full gap-4 lg:h-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
