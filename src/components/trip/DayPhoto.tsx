import Image from "next/image";
import type { CSSProperties } from "react";

import { dayImages } from "@/data/travel-images";
import { assetPath } from "@/lib/paths";

interface DayPhotoProps {
  day: number;
  title: string;
}

type DayPhotoStyle = CSSProperties & {
  "--photo-position": string;
};

export function DayPhoto({ day, title }: DayPhotoProps) {
  const photo = dayImages[day];

  if (!photo) return null;

  const style: DayPhotoStyle = {
    "--photo-position": photo.focalPosition,
  };

  return (
    <figure className="day-photo" style={style}>
      <Image
        className="day-photo__image"
        src={assetPath(photo.src)}
        alt={photo.alt}
        fill
        sizes="(min-width: 80rem) 62rem, (min-width: 64rem) calc(100vw - 18rem), calc(100vw - 3rem)"
        loading={day === 1 ? "eager" : "lazy"}
      />
      <figcaption className="day-photo__caption">
        <span>Day {day}</span>
        <span>{title}</span>
      </figcaption>
    </figure>
  );
}
