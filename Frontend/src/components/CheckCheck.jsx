"use client";
import { motion, useAnimation } from "framer-motion"; 
import React, { useEffect } from "react"; 
const checkVariants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const CheckCheck = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#22c55e", 
}) => {
  const controls = useAnimation();

 
  React.useEffect(() => {
    const playAnimation = async () => {
      await controls.start((i) => ({
        pathLength: 0,
        opacity: 0,
        transition: { delay: i * 0.1, duration: 0.1 },
      }));
      await controls.start((i) => ({
        pathLength: 1,
        opacity: 1,
        transition: { delay: i * 0.1, duration: 0.3 },
      }));
    };
    playAnimation();
  }, [controls]);

  return (
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
    >
      <motion.path
        d="M18 6 7 17l-5-5"
        variants={checkVariants}
        animate={controls}
        initial="normal"
        custom={0}
      />
      <motion.path
        d="m22 10-7.5 7.5L13 16"
        variants={checkVariants}
        animate={controls}
        initial="normal"
        custom={1}
      />
    </motion.svg>
  );
};
