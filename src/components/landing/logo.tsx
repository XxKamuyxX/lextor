import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showLink?: boolean;
};

const sizes = {
  sm: { width: 160, height: 64, className: "h-11 w-auto sm:h-12" },
  md: { width: 220, height: 88, className: "h-16 w-auto" },
  lg: { width: 360, height: 144, className: "h-24 w-auto sm:h-28 lg:h-32" },
};

export function Logo({ href = "/", size = "md", showLink = true }: LogoProps) {
  const { width, height, className } = sizes[size];

  const img = (
    <Image
      src="/brand/logo-lextor-white.png"
      alt="LEXTOR — Consultoria Patrimonial"
      width={width}
      height={height}
      className={className}
      priority
    />
  );

  if (!showLink) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}
