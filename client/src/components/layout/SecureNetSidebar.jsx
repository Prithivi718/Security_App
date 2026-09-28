import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings } from 'lucide-react';
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
    { label: 'Chats', icon: MessageSquare, route: '/app/chats' },
    { label: 'Users', icon: Users, route: '/app/users' },
    { label: 'Settings', icon: Settings, route: '/app/settings' },
];

// ── Sidebar Header ────────────────────────────────────────────────────────────

function SecureNetSidebarHeader() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
        <SidebarHeader className='border-b border-sidebar-border px-3 py-4'>
            <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
                {/* Brand mark — replace with logo asset once available in assets/ */}
                <div
                    className='flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm select-none'
                    aria-hidden='true'
                >
                    SN
                </div>
                {!collapsed && (
                    <span className='text-sm font-semibold tracking-tight text-sidebar-foreground truncate'>
                        SecureNet
                    </span>
                )}
            </div>
        </SidebarHeader>
    );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

function SecureNetNavItems() {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <SidebarMenu>
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
                        >
                            <Icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}

// ── Sidebar Footer (user identity) ────────────────────────────────────────────

function SecureNetSidebarFooter() {
    const { user } = useAuth();
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    const username = user?.userName ?? 'User';
    const initial = username[0]?.toUpperCase() ?? '?';

    return (
        <SidebarFooter className='border-t border-sidebar-border py-3'>
            <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'justify-center')}>
                <div
                    className='flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold select-none'
                    aria-label={`Logged in as ${username}`}
                    title={collapsed ? username : undefined}
                >
                    {initial}
                </div>
                {!collapsed && (
                    <span className='truncate text-sm font-medium text-sidebar-foreground'>
                        {username}
                    </span>
                )}
            </div>
        </SidebarFooter>
    );
}

// ── The sidebar component itself ─────────────────────────────────────────────

export function SecureNetSidebar() {
    return (
        <Sidebar collapsible='icon'>
            <SecureNetSidebarHeader />
            <SidebarContent className='py-3'>
                <SecureNetNavItems />
            </SidebarContent>
            <SecureNetSidebarFooter />
            <SidebarRail />
        </Sidebar>
    );
}

export { SidebarProvider, SidebarInset, SidebarTrigger };

export default SecureNetSidebar;
