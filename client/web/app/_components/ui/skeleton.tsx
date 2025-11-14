import React from "react";
import { cn } from "@/app/_libs/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export const Skeleton = ({
  className,
  lines = 0,
  ...rest
}: SkeletonProps) => {
  if (lines > 0) {
    return (
      <div className={cn("flex flex-col gap-2", className)} aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={"h-3 w-full rounded bg-muted animate-pulse"}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "h-4 w-full rounded-md bg-muted animate-pulse",
        className
      )}
      aria-hidden
      {...rest}
    />
  );
};
