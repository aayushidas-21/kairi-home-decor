import { useEffect } from "react";

export function AudioTriggers() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Click Listener for Premium Haptic Tap
    const handleGlobalClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Match button elements, anchors styled as buttons, or custom interactable items
      const isInteractive = 
        target.closest("button") || 
        target.closest("[role='button']") ||
        target.closest("input[type='submit']") ||
        (target.closest("a") && (
          target.closest("a")?.classList.contains("rounded-full") ||
          target.closest("a")?.classList.contains("bg-clay") ||
          target.closest("a")?.classList.contains("border-espresso")
        ));

      if (isInteractive) {
        // Lazy load the audio module only on the first interaction
        try {
          const { playPremiumTap } = await import("@/lib/audio");
          playPremiumTap();
        } catch (err) {
          console.error("Failed to load or play tap audio:", err);
        }
      }
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });

    // 2. MutationObserver for Toast Notifications (Automatic Chime Trigger)
    const playChime = async () => {
      try {
        const { playPremiumChime } = await import("@/lib/audio");
        playPremiumChime();
      } catch (err) {
        console.error("Failed to load or play chime audio:", err);
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const hasNewToast = Array.from(mutation.addedNodes).some(
            (node) => 
              node instanceof HTMLElement && 
              (node.hasAttribute("data-sonner-toast") || node.querySelector("[data-sonner-toast]"))
          );
          if (hasNewToast) {
            playChime();
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
      observer.disconnect();
    };
  }, []);

  return null;
}
