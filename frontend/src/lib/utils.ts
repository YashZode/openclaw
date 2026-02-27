/** Merge class names — lightweight alternative to clsx + tailwind-merge */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
