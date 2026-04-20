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
    const introAudio = new Audio("/sounds/intro-whoosh.mp3");
    const targetVolume = 0.35;
    introAudio.volume = 0;
    introAudio.play().catch(() => {
      // Autoplay can be blocked by browser policies.
    });

    const fadeInStepMs = 50;
    const fadeInAmount = targetVolume / 8;
    const fadeInTimer = window.setInterval(() => {
      introAudio.volume = Math.min(targetVolume, introAudio.volume + fadeInAmount);
      if (introAudio.volume >= targetVolume) window.clearInterval(fadeInTimer);
    }, fadeInStepMs);

    const fadeOutTimer = window.setTimeout(() => {
      const fadeOutStepMs = 50;
      const fadeOutAmount = targetVolume / 8;
      const fadeOutInterval = window.setInterval(() => {
        introAudio.volume = Math.max(0, introAudio.volume - fadeOutAmount);
        if (introAudio.volume <= 0) {
          window.clearInterval(fadeOutInterval);
        }
      }, fadeOutStepMs);
    }, 2000);

    const timer = setTimeout(() => setShow(false), 2500);
    return () => {
      window.clearInterval(fadeInTimer);
      window.clearTimeout(fadeOutTimer);
      clearTimeout(timer);
      introAudio.pause();
      introAudio.currentTime = 0;
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
