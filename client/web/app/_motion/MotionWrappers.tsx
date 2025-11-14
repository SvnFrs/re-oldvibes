"use client";
import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { fadeIn, slideUp, scaleIn } from "./variants";

type WrapperProps = HTMLMotionProps<"div"> & { as?: React.ElementType };

function createWrapper(variant: any) {
  return function Wrapper({ as: Comp = "div", children, ...rest }: WrapperProps) {
    return (
      <Comp as={Comp}>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <motion.div
          variants={variant}
          initial="hidden"
          animate="visible"
          exit="hidden"
          {...rest}
        >
          {children}
        </motion.div>
      </Comp>
    );
  };
}

export const FadeIn = createWrapper(fadeIn);
export const SlideUp = createWrapper(slideUp);
export const ScaleIn = createWrapper(scaleIn);
