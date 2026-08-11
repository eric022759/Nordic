"use client";

import Link from "next/link";
import { Home, Info, Luggage, MapPinned, Route } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { isNavigationItemActive } from "./navigation";

export interface SiteNavItem {
  href: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
}

export const SITE_NAV_ITEMS: readonly SiteNavItem[] = [
  { href: "/", label: "首頁", shortLabel: "首頁", Icon: Home },
  {
    href: "/itinerary/",
    label: "每日行程",
    shortLabel: "行程",
    Icon: Route,
  },
  {
    href: "/destinations/",
    label: "目的地",
    shortLabel: "目的地",
    Icon: MapPinned,
  },
  {
    href: "/prepare/",
    label: "行前準備",
    shortLabel: "準備",
    Icon: Luggage,
  },
  {
    href: "/info/",
    label: "旅行資訊",
    shortLabel: "資訊",
    Icon: Info,
  },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="主要導覽">
      <div className="mobile-nav__inner">
        {SITE_NAV_ITEMS.map(({ href, shortLabel, label, Icon }) => {
          const isActive = isNavigationItemActive(pathname, href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className="mobile-nav__link"
              data-active={isActive ? "true" : "false"}
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
