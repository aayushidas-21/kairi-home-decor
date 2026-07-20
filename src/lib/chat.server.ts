import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// --- SECURITY & RATE LIMITING SYSTEM ---
// Sliding-window rate limiter: max 10 requests per minute per client session
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientKey) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(clientKey, validTimestamps);
  return false;
}

// --- TOKEN-SAVING ADVANCED MEMORY CACHE SYSTEM ---
// In-memory LRU cache storing normalized query -> response mapping (1-hour TTL)
interface CacheEntry {
  answer: string;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 250;

function getCachedResponse(normalizedQuery: string): string | null {
  const entry = queryCache.get(normalizedQuery);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    queryCache.delete(normalizedQuery);
    return null;
  }
  return entry.answer;
}

function setCachedResponse(normalizedQuery: string, answer: string): void {
  if (queryCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = queryCache.keys().next().value;
    if (oldestKey) queryCache.delete(oldestKey);
  }
  queryCache.set(normalizedQuery, { answer, timestamp: Date.now() });
}

// --- FALLBACK CONTACT MESSAGE ---
const FALLBACK_MESSAGE =
  "I'm having a brief moment of reflection. Please reach out directly to our human care team at contact@kairihomedecor.in or call +91 98765 43210 and we'll assist you immediately. ✦";

// --- KAIRI SYSTEM KNOWLEDGE PROMPT ---
const KAIRI_SYSTEM_PROMPT = `You are Kairi AI, a warm, serene, humanized wabi-sabi home decor advisor for Kairi (Est. 2026, India).
You help customers select intentional home decor items like handcrafted ceramics, linen cushions, wool blankets, Kannauj incense, and brass accents.

Brand Knowledge & Policies:
- Currency: All prices are in Indian Rupees (₹).
- Shipping: Free express shipping across India on orders above ₹2,000. Standard delivery in 3-5 business days.
- Returns: Easy 7-day hassle-free return and exchange policy.
- Customer Care: Email contact@kairihomedecor.in or call +91 98765 43210 (Mon-Sat, 10 AM - 7 PM).
- Core Catalog Highlights:
  • Aanvi Linen Cushion (₹1,490): Stonewashed oat European flax linen, 18×18.
  • Mitti Ceramic Donut Vase (₹2,250): Hand-sculpted terracotta donut vase with textured stone glaze.
  • Neel Indigo Chai Cup (₹850): Hand-painted cobalt indigo glaze, 250ml studio pottery cup.
  • Kesar Chai Kulhar Set of 2 (₹1,150): Raw clay exterior with golden saffron interior glaze.
  • Mogra Incense Cones Pack of 30 (₹650): Hand-rolled Mogra flowers and sandalwood dust.
  • Kavi Jute Cushion (₹1,650): Woven golden jute with unbleached cotton backing.
  • Khus Root Room Mist 100ml (₹950): Steam-distilled wild vetiver roots from Kannauj.
  • Aanya Linen Curtains (₹3,200): 100% Belgian flax linen, soft light-filtering drape.
  • Tara Brass Wall Hanging (₹2,100): Hand-beaten brass bells with raw cotton tassels.

Guidelines:
1. Maintain a calm, warm, humanized wabi-sabi tone. Avoid robotic bullet points or overly formal sales talk.
2. Keep answers concise (2 to 4 sentences).
3. Always suggest relevant Kairi products when appropriate.`;

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z
      .object({
        message: z.string().min(1).max(500),
        sessionId: z.string().optional(),
      })
      .parse(data);
  })
  .handler(async ({ data }) => {
    const { message, sessionId = "default_session" } = data;

    // 1. Check Rate Limit
    if (isRateLimited(sessionId)) {
      return {
        success: true,
        answer: "You are asking questions a bit quickly! Please take a gentle breath and try again in a minute. ✦",
        cached: false,
      };
    }

    // 2. Check Advanced Memory Cache (Normalized string match)
    const normalized = message.trim().toLowerCase().replace(/[^\w\s]/gi, "");
    const cached = getCachedResponse(normalized);
    if (cached) {
      return {
        success: true,
        answer: cached,
        cached: true,
      };
    }

    // 3. Retrieve Server Key securely
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      console.warn("GROQ_API_KEY not configured on server.");
      return {
        success: true,
        answer: FALLBACK_MESSAGE,
        cached: false,
      };
    }

    try {
      // Primary model: llama-3.3-70b-versatile, with fallback to llama3-8b-8192
      let groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: KAIRI_SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          temperature: 0.6,
          max_tokens: 300,
        }),
      });

      // Retry with 8b model if 70b model hits rate limit or fails
      if (!groqRes.ok && groqRes.status === 429) {
        groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: KAIRI_SYSTEM_PROMPT },
              { role: "user", content: message },
            ],
            temperature: 0.6,
            max_tokens: 300,
          }),
        });
      }

      if (!groqRes.ok) {
        console.error("Groq API Response error:", groqRes.status, await groqRes.text());
        return {
          success: true,
          answer: FALLBACK_MESSAGE,
          cached: false,
        };
      }

      const json = await groqRes.json();
      const answer = json?.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        return {
          success: true,
          answer: FALLBACK_MESSAGE,
          cached: false,
        };
      }

      // Save to server-side LRU memory cache
      setCachedResponse(normalized, answer);

      return {
        success: true,
        answer,
        cached: false,
      };
    } catch (err) {
      console.error("Failed to connect to Groq API:", err);
      return {
        success: true,
        answer: FALLBACK_MESSAGE,
        cached: false,
      };
    }
  });
