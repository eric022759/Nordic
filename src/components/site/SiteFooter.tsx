import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RouteLine } from "./RouteLine";

const footerLinks = [
  { href: "/itinerary/", label: "每日行程" },
  { href: "/destinations/", label: "目的地指南" },
  { href: "/prepare/", label: "行前準備" },
  { href: "/info/", label: "旅行資訊" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-footer__top">
          <div>
            <p className="site-footer__eyebrow">Copenhagen · Oslo · Stockholm · Helsinki</p>
            <p className="site-footer__title">一路向北，慢慢抵達。</p>
          </div>

          <nav className="site-footer__nav" aria-label="頁尾導覽">
            {footerLinks.map(({ href, label }) => (
              <Link href={href} key={href}>
                {label}
                <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            ))}
          </nav>
        </div>

        <RouteLine className="site-footer__route" tone="mist" stops={4} />

        <div className="site-footer__bottom">
          <p>丹麥 · 挪威 · 瑞典 · 芬蘭</p>
          <p>2026/08/28—09/09 · 家庭私人旅程</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
