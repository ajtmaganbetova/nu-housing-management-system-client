"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { appConfig } from "@/lib/config";
import {
  getDashboardPathForRole,
  signInWithGoogleIdToken,
} from "@/lib/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>
          ) => void;
        };
      };
    };
  }
}

export default function OAuthButtons() {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (
      !scriptLoaded ||
      !appConfig.googleClientId ||
      !buttonRef.current ||
      !window.google
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: appConfig.googleClientId,
      callback: async ({ credential }) => {
        if (!credential) {
          setError("Google did not return an ID token.");
          return;
        }

        setError("");
        setIsLoading(true);

        try {
          const session = await signInWithGoogleIdToken(credential);
          window.location.assign(getDashboardPathForRole(session.user?.role));
        } catch (signInError) {
          setError(
            signInError instanceof Error
              ? signInError.message
              : "Google sign-in failed."
          );
          setIsLoading(false);
        }
      },
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: "320",
    });
  }, [scriptLoaded]);

  if (!appConfig.oauthProviders.includes("google")) return null;

  return (
    <div className="space-y-3">
      {!appConfig.googleClientId ? (
        <p className="text-xs text-amber-700">
          Google sign-in is disabled until `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured.
        </p>
      ) : (
        <>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => setScriptLoaded(true)}
          />
          <div className={isLoading ? "pointer-events-none opacity-60" : ""}>
            <div ref={buttonRef} className="flex justify-center" />
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
