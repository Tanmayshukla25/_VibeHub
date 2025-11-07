"use client";

import React from "react";
import { motion, useAnimation } from "framer-motion";

// ✅ Animation variants for bell motion
const bellVariants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [-15, 15, -10, 10, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const ringVariants = {
  normal: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * 🔔 Animated Bell Icon (auto + hover motion)
 *
 * Props:
 * - width, height: icon size
 * - stroke: color of stroke (default white)
 * - strokeWidth: line thickness
 * - animate: external animation control (useAnimation())
 */
export const BellRing = ({
  width = 26,
  height = 26,
  stroke = "#ffffff",
  strokeWidth = 2,
  animate, // external controls from Sidebar
  ...props
}) => {
  const localControls = useAnimation();
  const controls = animate || localControls;

  // Animate on hover (if external controls not provided)
  const handleMouseEnter = () => {
    if (!animate) controls.start("animate");
  };
  const handleMouseLeave = () => {
    if (!animate) controls.start("normal");
  };

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={controls}
        initial="normal"
        {...props}
      >
        {/* 🔔 Bell handle */}
        <motion.path
          d="M10.268 21a2 2 0 0 0 3.464 0"
          variants={bellVariants}
        />

        {/* 🔔 Top motion waves */}
        <motion.g variants={ringVariants}>
          <path d="M22 8c0-2.3-.8-4.3-2-6" />
          <path d="M4 2C2.8 3.7 2 5.7 2 8" />
        </motion.g>

        {/* 🔔 Bell body */}
        <motion.path
          d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
          variants={bellVariants}
        />
      </motion.svg>
    </div>
  );
};
