"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: any;
  }
}

export function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ✅ Load script once globally
  useEffect(() => {
    if (window.turnstile) {
      setLoaded(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;

    script.onload = () => setLoaded(true);
    script.onerror = () => onError?.();

    document.head.appendChild(script);
  }, [onError]);

  // ✅ Render widget
  useEffect(() => {
    if (!loaded || !containerRef.current || !window.turnstile) return;

    // ป้องกัน render ซ้ำ
    if (widgetIdRef.current) return;

    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      size: "normal",

      callback: (token: string) => {
        onVerify(token);
      },

      "error-callback": () => {
        widgetIdRef.current = null;
        onError?.();
      },

      "expired-callback": () => {
        widgetIdRef.current = null;
        onExpire?.();
      },
    });

    widgetIdRef.current = id;

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [loaded, siteKey, onVerify, onError, onExpire]);

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
}