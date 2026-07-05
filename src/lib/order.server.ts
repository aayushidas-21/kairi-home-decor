import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    let adminDbInstance = null;
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      adminDbInstance = adminDb;
    } catch (e) {
      console.warn("Firebase Admin SDK is not available, falling back to Client SDK:", e);
    }

    // 1. Recalculate prices and totals from Firestore (trusted source)
    let subtotal = 0;
    const recomputedItems = [];

    if (adminDbInstance) {
      // Use Admin SDK
      for (const item of data.items) {
        const prodDoc = await adminDbInstance.collection("products").doc(item.id).get();
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
    } else {
      // Use Client SDK Fallback (useful when Admin env vars are not set on Vercel)
      const { db } = await import("@/lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");

      for (const item of data.items) {
        const prodDocRef = doc(db, "products", item.id);
        const prodDoc = await getDoc(prodDocRef);
        if (!prodDoc.exists()) {
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
    }

    const shipping = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;
    const itemCount = data.items.reduce((acc, item) => acc + item.qty, 0);

    // 2. Generate same order number format
    const orderNumber = `KAI-${Date.now().toString(36).toUpperCase()}`;

    // 3. Write order document to Firestore
    const orderData = {
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
    };

    if (adminDbInstance) {
      await adminDbInstance.collection("orders").doc(orderNumber).set(orderData);
    } else {
      const { db } = await import("@/lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "orders", orderNumber), orderData);
    }

    return {
      orderNumber,
      total,
      itemCount,
    };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      orderId: z.string().min(1),
      status: z.enum(["processing", "confirmed", "shipped", "delivered", "cancelled"]),
    })
  )
  .handler(async ({ data }) => {
    let adminDbInstance = null;
    try {
      const { adminDb } = await import("@/lib/firebase-admin");
      adminDbInstance = adminDb;
    } catch (e) {
      console.warn("Firebase Admin SDK is not available, falling back to Client SDK:", e);
    }

    if (adminDbInstance) {
      await adminDbInstance.collection("orders").doc(data.orderId).update({
        status: data.status,
      });
    } else {
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "orders", data.orderId), {
        status: data.status,
      });
    }

    return { success: true };
  });
