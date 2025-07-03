import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "./ThemeSwitcher";

const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:px-8">
      <div>
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default Header;
