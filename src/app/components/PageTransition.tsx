"use client";

import { motion } from 'framer-motion';
import { useRouter } from "next/navigation";
import * as React from "react";

const pageVariants = {
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: '-100%' },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 1,
};

const PageTransition = ({ children }: any) => {
  return (
    <motion.div
      initial="exit"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
