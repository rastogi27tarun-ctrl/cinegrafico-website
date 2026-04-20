"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const introSeen = window.sessionStorage.getItem("cg_intro_seen");
    if (introSeen === "1") {
      setShow(false);
      return;
    }

    window.sessionStorage.setItem("cg_intro_seen", "1");
    const playSound = () => {
      const audio = new Audio("/sound/intro-whoosh.mp3");
      setTimeout(() => {
        audio.play().catch(() => {});
      }, 300);
      window.removeEventListener("scroll", playSound);
    };

    window.addEventListener("scroll", playSound);

    const timer = setTimeout(() => setShow(false), 2500);
    return () => {
      window.removeEventListener("scroll", playSound);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="intro-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, scale: 1, letterSpacing: "0.05em" }}
            transition={{ duration: 1.2 }}
          >
            CINEGRAFICO
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
