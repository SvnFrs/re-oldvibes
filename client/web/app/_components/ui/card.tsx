import React from "react";
import { cn } from "@/app/_libs/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gruvbox-dark-bg2 bg-gruvbox-dark-bg1/60 backdrop-blur-sm shadow-sm",
          interactive &&
            "transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        {...rest}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("p-4 border-b flex items-center gap-2", className)}
    {...rest}
  />
);

export const CardTitle = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("font-semibold leading-tight text-base", className)}
    {...rest}
  />
);

export const CardContent = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4", className)} {...rest} />
);

export const CardFooter = ({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 border-t", className)} {...rest} />
);
