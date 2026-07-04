import { createServerFn } from "@tanstack/react-start";
import { adminDb } from "@/lib/firebase-admin";
import { z } from "zod";

if (typeof window !== "undefined") {
  throw new Error("firebase-admin cannot be imported on the client side.");
}

const orderInputSchema = z.object({
  userId: z.string().nullable(),
  email: z.string().trim().email(),
  name: z.string().trim(),
  phone: z.string().trim(),
  shippingAddress: z.object({
    address1: z.string().trim(),
    address2: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim(),
    state: z.string().trim(),
    pincode: z.string().trim(),
    country: z.string().trim(),
  }),
  items: z.array(
    z.object({
      id: z.string(),
      qty: z.number().int().positive(),
    })
  ),
  payMethod: z.enum(["card", "upi", "cod"]),
});

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => orderInputSchema.parse(data))
  .handler(async ({ data }) => {
    if (!adminDb) {
      throw new Error("Firebase Admin Database is not initialized.");
    }

    // 1. Recalculate prices and totals from Firestore (trusted source)
    let subtotal = 0;
    const recomputedItems = [];

    for (const item of data.items) {
      const prodDoc = await adminDb.collection("products").doc(item.id).get();
      if (!prodDoc.exists) {
        throw new Error(`Product not found: ${item.id}`);
      }
      const prodData = prodDoc.data();
      if (!prodData) {
        throw new Error(`Empty product details: ${item.id}`);
      }
      const price = Number(prodData.price) || 0;
      subtotal += price * item.qty;

      recomputedItems.push({
        id: item.id,
        name: prodData.name || "Unknown Item",
        price: price,
        qty: item.qty,
      });
    }

    const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;
    const itemCount = data.items.reduce((acc, item) => acc + item.qty, 0);

    // 2. Generate same order number format
    const orderNumber = `KAI-${Date.now().toString(36).toUpperCase()}`;

    // 3. Write order document to Firestore via Admin SDK (bypasses rules)
    await adminDb.collection("orders").doc(orderNumber).set({
      orderNumber,
      userId: data.userId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      shippingAddress: data.shippingAddress,
      items: recomputedItems,
      total,
      itemCount,
      payMethod: data.payMethod,
      createdAt: new Date().toISOString(),
      status: "processing",
    });

    return {
      orderNumber,
      total,
      itemCount,
    };
  });
