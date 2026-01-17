import React from 'react';
import Link from 'next/link';
import {cn} from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {CartDrawer} from "@/components/cart";
import {ThemeToggle} from "@/components/ThemeToggle";

export const Navbar: React.FC = () => {

    const navItems = [
        {name: 'About', href: '/about'},
        {name: 'Shop', href: '/shop'},
    ];

    return (
        <NavigationMenu className={"border-b border-border bg-background w-full"}>
            <div className="container mx-auto px-4 flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                    <Link href="/" passHref>
                        <div className="text-xl font-bold">Telescope Shop</div>
                    </Link>
                </div>
                <div className="flex items-center space-x-4">
                    <NavigationMenuList className="flex space-x-4">
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.name}>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'px-3 py-2 rounded-md text-sm font-medium'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                    <CartDrawer />
                    <ThemeToggle/>
                </div>
            </div>
        </NavigationMenu>
    );
};

export default Navbar;
