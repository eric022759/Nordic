import type { CSSProperties, ReactNode } from "react";

import {
  pageBackgroundImages,
  type PageBackgroundKey,
} from "@/data/travel-images";
import { assetPath } from "@/lib/paths";

interface ScenicPageShellProps {
  background: PageBackgroundKey;
  children: ReactNode;
  className?: string;
}

type ScenicPageStyle = CSSProperties & {
  "--scenic-image": string;
  "--scenic-position": string;
};

export function ScenicPageShell({
  background,
  children,
  className = "",
}: ScenicPageShellProps) {
  const photo = pageBackgroundImages[background];
  const style: ScenicPageStyle = {
    "--scenic-image": `url("${assetPath(photo.src)}")`,
    "--scenic-position": photo.focalPosition,
  };

  return (
    <main
      className={`page-shell scenic-page ${className}`.trim()}
      style={style}
    >
      {children}
    </main>
  );
}
