import React from "react";
import { cn } from "@/app/_libs/utils";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: "sm" | "md" | "lg" | "xl" | "full";
  padded?: boolean;
}

const widthMap = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export const PageShell = ({
  className,
  children,
  width = "md",
  padded = true,
  ...rest
}: PageShellProps) => {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        widthMap[width],
        padded && "px-4 md:px-6",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const SectionHeader = ({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mb-6 md:mb-8", className)}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gruvbox-dark-fg0">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-gruvbox-dark-fg3 max-w-prose">
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  </div>
);
