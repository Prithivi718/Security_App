import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { cn } from '../../lib/utils.js';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
    useSidebar,
} from '../ui/sidebar.jsx';

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { label: 'Chats', icon: MessageSquare, route: '/app/chats', badge: 'E2EE' },
    { label: 'Users & Friends', icon: Users, route: '/app/users' },
    { label: 'Settings', icon: Settings, route: '/app/settings' },
];

// ── Sidebar Header ────────────────────────────────────────────────────────────

function SecureNetSidebarHeader() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
        <SidebarHeader className='px-4 py-4 border-b border-[#E5E5E5]/70 bg-gradient-to-b from-[#FFFFFF] to-[#FAFAFA]'>
            <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                {/* Shield Security Brand Logo */}
                <div
                    className='relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-white shadow-sm font-bold text-sm select-none transition-transform hover:scale-105'
                    aria-hidden='true'
                >
                    <ShieldCheck className="size-5 text-[#FFFFFF]" />
                    <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2.5 bg-[#16A34A]"></span>
                    </span>
                </div>
                {!collapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className='text-sm font-bold tracking-tight text-[#111111] truncate flex items-center gap-1.5'>
                            SecureNet <Sparkles className="size-3 text-[#EAB308]" />
                        </span>
                        <span className="text-[10px] font-semibold text-[#888888] tracking-wider uppercase">
                            Zero-Knowledge
                        </span>
                    </div>
                )}
            </div>
        </SidebarHeader>
    );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

function SecureNetNavItems() {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
        <SidebarMenu className="px-2 space-y-1">
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.route);

                return (
                    <SidebarMenuItem key={item.route}>
                        <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.label}
                            onClick={() => navigate(item.route)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'h-10 px-3 rounded-lg font-medium text-sm transition-all duration-150 flex items-center gap-3',
                                isActive
                                    ? 'bg-[#111111] text-[#FFFFFF] shadow-sm font-semibold hover:bg-[#111111] hover:text-[#FFFFFF]'
                                    : 'text-[#555555] hover:bg-[#F0F0F0] hover:text-[#111111]'
                            )}
                        >
                            <span className="flex items-center justify-center size-5 shrink-0">
                                <Icon className={cn("size-4 shrink-0 transition-colors stroke-[2]", isActive ? "!text-[#FFFFFF] !stroke-[#FFFFFF]" : "text-[#555555] group-hover:text-[#111111]")} />
                            </span>
                            {!collapsed && (
                                <div className="flex items-center justify-between flex-1 min-w-0">
                                    <span className="truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-1",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-[#EAEAEA] text-[#666666]"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

// ── Sidebar Footer ────────────────────────────────────────────────────────────

function SecureNetSidebarFooter() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    const username = user?.userName ?? 'User';
    const initial = username[0]?.toUpperCase() ?? '?';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <SidebarFooter className='border-t border-[#E5E5E5]/80 p-3 bg-gradient-to-t from-[#FFFFFF] to-[#FAFAFA]'>
            <div className={cn('flex items-center justify-between p-1 rounded-xl border border-[#EBEBEB] bg-[#FFFFFF] shadow-2xs', collapsed && 'justify-center border-none bg-transparent shadow-none')}>
                <div className={cn('flex items-center gap-2.5 px-1 min-w-0', collapsed && 'justify-center')}>
                    <div
                        className='relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-bold select-none shadow-xs'
                        aria-label={`Logged in as ${username}`}
                        title={collapsed ? username : undefined}
                    >
                        {initial}
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className='truncate text-xs font-bold text-[#111111]'>
                                {username}
                            </span>
                            <span className="text-[10px] font-medium text-[#16A34A] flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-[#22C55E]"></span> Active
                            </span>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="p-2 rounded-lg text-[#777777] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut className="size-4" />
                    </button>
                )}
            </div>

            {collapsed && (
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex size-8 items-center justify-center rounded-lg text-[#777777] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 transition-colors self-center mt-2"
                    aria-label="Logout"
                >
                    <LogOut className="size-4" />
                </button>
            )}
        </SidebarFooter>
    );
}

// ── Main Sidebar Export ────────────────────────────────────────────────────────

export function SecureNetSidebar() {
    return (
        <Sidebar collapsible='icon' className="bg-[#FFFFFF] border-r border-[#E5E5E5] shadow-xs">
            <SecureNetSidebarHeader />
            <SidebarContent className='py-4'>
                <SecureNetNavItems />
            </SidebarContent>
            <SecureNetSidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

export { SidebarProvider, SidebarInset, SidebarTrigger };
export default SecureNetSidebar;
