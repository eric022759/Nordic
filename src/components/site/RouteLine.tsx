import type { CSSProperties } from "react";

export interface RouteLineProps {
  className?: string;
  stops?: number;
  tone?: "pine" | "mist";
  vertical?: boolean;
}

/** A CSS-only route motif; decorative by design and ignored by screen readers. */
export function RouteLine({
  className = "",
  stops = 5,
  tone = "pine",
  vertical = false,
}: RouteLineProps) {
  const stopCount = Math.max(2, Math.min(stops, 8));

  return (
    <div
      aria-hidden="true"
      className={["route-line", className].filter(Boolean).join(" ")}
      data-orientation={vertical ? "vertical" : "horizontal"}
      data-tone={tone}
    >
      <span className="route-line__track" />
      <span className="route-line__stops">
        {Array.from({ length: stopCount }, (_, index) => (
          <span
            className="route-line__stop"
            key={index}
            style={{ "--route-stop-index": index } as CSSProperties}
          />
        ))}
      </span>
    </div>
  );
}

export default RouteLine;
