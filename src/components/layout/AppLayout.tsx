
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, History, BrainCircuit } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import Header from '@/components/layout/Header';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/upload', label: 'New Quiz', icon: Upload },
  { href: '/history', label: 'History', icon: History },
];

const quizCreationPaths = ['/upload', '/review', '/configure'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isQuizCreationPath = (path: string) => quizCreationPaths.includes(path);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
             <BrainCircuit className="h-6 w-6 text-primary" />
             <span className="text-lg font-bold font-headline">QuizGenius</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === item.href ||
                    (item.href === '/upload' && isQuizCreationPath(pathname))
                  }
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header />
        <div className="flex-grow flex flex-col p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
