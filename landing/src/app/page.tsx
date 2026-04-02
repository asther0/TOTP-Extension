"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";

export default function Home() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/asther0/TOTP-Extension")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count !== undefined) {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="h-screen overflow-hidden">
      <Hero stars={stars} />
    </main>
  );
}
