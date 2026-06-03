import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  category: z.enum([
    "SOAP",
    "BODY_WASH",
    "LOTION",
    "SCRUB",
    "AROMATHERAPY",
    "GIFT_SET",
  ]),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string()).default([]),
  ingredients: z.string().optional().nullable(),
  fragrance: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const orderUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  notes: z.string().optional().nullable(),
});

export const customerUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Please include a bit more detail"),
});

export const stockNotifySchema = z.object({
  email: z.string().email("Please enter a valid email"),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
});

export const wholesaleSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Please enter a valid email"),
  website: z.string().optional(),
  message: z.string().min(20, "Tell us about your business and needs"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const storeSettingsSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  flatShippingRate: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  notifyNewOrder: z.boolean(),
  notifyOrderShipped: z.boolean(),
  notifyLowStock: z.boolean(),
  notifyNewCustomer: z.boolean(),
  maintenanceMode: z.boolean().optional().default(false),
  featureCheckout: z.boolean().optional().default(true),
  featureNewsletter: z.boolean().optional().default(true),
  bannedKeywords: z.string().optional().default(""),
  allowedEmailDomains: z.string().optional().default(""),
});

export const adminInviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const checkoutFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / region is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

export const checkoutSchema = checkoutFormSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().positive(),
        name: z.string().optional(),
        slug: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .min(1, "Cart is empty"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type CheckoutPayload = z.infer<typeof checkoutSchema>;

export type ProductFormData = z.infer<typeof productSchema>;
export type OrderUpdateData = z.infer<typeof orderUpdateSchema>;
export type CustomerUpdateData = z.infer<typeof customerUpdateSchema>;
export type AdminInviteData = z.infer<typeof adminInviteSchema>;
export type StoreSettingsData = z.infer<typeof storeSettingsSchema>;
