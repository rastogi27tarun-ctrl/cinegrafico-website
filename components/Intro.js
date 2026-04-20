"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Intro() {
  const [stage, setStage] = useState("logo");
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const introSeen = window.sessionStorage.getItem("cg_intro_seen");
    if (introSeen === "1") {
      setStage("end");
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

    const logoTimer = setTimeout(() => {
      setStage("clap");
      setShowFlash(true);
    }, 1200);
    const flashTimer = setTimeout(() => setShowFlash(false), 1320);
    const endTimer = setTimeout(() => setStage("end"), 1800);
    return () => {
      window.removeEventListener("scroll", playSound);
      clearTimeout(logoTimer);
      clearTimeout(flashTimer);
      clearTimeout(endTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {stage !== "end" && (
        <motion.div
          className="intro-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {stage === "logo" && (
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              CINEGRAFICO STUDIOS
            </motion.h1>
          )}

          {stage === "clap" && (
            <motion.div
              className="clap-bar"
              initial={{ rotate: -70 }}
              animate={{ rotate: 0, x: [0, -5, 5, 0] }}
              transition={{ duration: 0.2 }}
            />
          )}
          {showFlash ? <div className="flash" /> : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
