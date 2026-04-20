"use client";

import { motion } from "framer-motion";

export default function MotionHeading({ children, className }) {
  return (
    <motion.h2
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.h2>
  );
}
