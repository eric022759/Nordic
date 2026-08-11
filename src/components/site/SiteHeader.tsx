"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { assetPath } from "@/lib/paths";
import { MobileNav, SITE_NAV_ITEMS } from "./MobileNav";
import { isNavigationItemActive } from "./navigation";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="site-container site-header__inner">
          <Link className="site-brand" href="/" aria-label="北歐四國旅行首頁">
            <span className="site-brand__mark" aria-hidden="true">
              <Image
                alt=""
                className="site-brand__logo"
                height={48}
                src={assetPath("/images/web-page-logo.png")}
                width={48}
              />
            </span>
            <span className="site-brand__copy">
              <span className="site-brand__name">北歐四國</span>
              <span className="site-brand__subtitle">13 日私人旅程</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="主要導覽">
            {SITE_NAV_ITEMS.map(({ href, label }) => {
              const isActive = isNavigationItemActive(pathname, href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className="desktop-nav__link"
                  data-active={isActive ? "true" : "false"}
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <p className="site-header__date" aria-label="旅行日期 2026 年 8 月 28 日至 9 月 9 日">
            <span>2026</span>
            08.28 — 09.09
          </p>
        </div>
      </header>
      <MobileNav />
    </>
  );
}

export default SiteHeader;
