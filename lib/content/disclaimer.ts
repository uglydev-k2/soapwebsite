/** Based on MV Luscious Lather's original Shopify FDA Regulations page. */
export const PRODUCT_DISCLAIMER_INTRO =
  "FDA regulations state that bath and body companies cannot make health-related claims about beauty products.";

export const PRODUCT_DISCLAIMER_SECTIONS = [
  {
    title: "No medical or health claims",
    body: `${PRODUCT_DISCLAIMER_INTRO} MV Luscious Lather is not a medical or healthcare provider. We do not claim that the use of our products will diagnose, treat, cure, or prevent any disease, or have a positive effect on any pre-existing physical or mental health condition.`,
  },
  {
    title: "Informational use only",
    body: "Product descriptions, ingredient notes, and content on this website describe the properties of specific ingredients and are for general informational purposes only. They are not medical advice and should not be used to self-diagnose or self-treat any illness or skin condition.",
  },
  {
    title: "Consult a healthcare professional",
    body: "Please consult your physician, dermatologist, or other licensed healthcare provider before using our products — especially if you are pregnant, nursing, have sensitive skin, allergies, eczema, psoriasis, acne, rosacea, or any other medical or skin condition — to confirm they are suitable for you.",
  },
  {
    title: "Patch test recommended",
    body: "Our products contain natural oils, butters, botanicals, and essential oils. Individual sensitivities may occur. We strongly recommend a patch test before full use: apply a small amount to the inner forearm, wait 24 hours, and discontinue use if redness, itching, burning, or irritation develops.",
  },
  {
    title: "External use only",
    body: "Our bath and body products are for external use only. Keep out of reach of children. Avoid contact with eyes. If irritation occurs, discontinue use and seek medical advice if needed.",
  },
] as const;

/** Short notice shown on product pages and in the footer. */
export const PRODUCT_DISCLAIMER_SHORT =
  "We do not make medical or health claims. Consult your physician or healthcare provider before use if you have a skin condition or health concern. Patch test recommended.";
