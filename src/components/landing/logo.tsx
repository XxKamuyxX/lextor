import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showLink?: boolean;
};

const sizes = {
  sm: { width: 120, height: 48, className: "h-10 w-auto" },
  md: { width: 160, height: 64, className: "h-14 w-auto" },
  lg: { width: 220, height: 88, className: "h-20 w-auto sm:h-24" },
};

export function Logo({ href = "/", size = "md", showLink = true }: LogoProps) {
  const { width, height, className } = sizes[size];

  const img = (
    <Image
      src="/brand/logo-etr.png"
      alt="ETR — Consultoria de Investimentos"
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
