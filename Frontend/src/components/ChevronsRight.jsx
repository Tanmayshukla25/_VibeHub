"use client";
import { motion, useAnimation } from "framer-motion";

const chevronVariants = {
  normal: {
    x: 0,
    opacity: 1,
  },
  animate: {
    x: [4, 0],
    opacity: [0.3, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const ChevronsRight = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#ffffff",
  ...props
}) => {
  const controls = useAnimation();

  return (
    <div
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="m6 17 5-5-5-5"
          variants={chevronVariants}
          animate={controls}
          initial="normal"
        />
        <motion.path
          d="m13 17 5-5-5-5"
          variants={chevronVariants}
          animate={controls}
          initial="normal"
          transition={{ delay: 0.1 }}
        />
      </svg>
    </div>
  );
};
