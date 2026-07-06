# CLAUDE.md — Lolo Cosmetics Showcase Website

> This file is the single source of truth for the project. Every session (Claude or human)
> should read this first. Update it whenever a decision is made or changed.

---

## 1. Project Overview

- **Store name:** Lolo (لولو)
- **Owner:** The user's friend — opening a store for cosmetics & personal care products.
- **What this is:** A **showcase website** — customers browse products, prices, images, and
  usage details, then order by contacting the store on **WhatsApp**.
- **What this is NOT:** It is **not an e-commerce store**. No online payments, no cart,
  no checkout. Ordering happens entirely through WhatsApp conversation.
- **Business flow:** Customer visits site → browses products → clicks WhatsApp button on a
  product → chat opens with a pre-filled message → store finalizes the order manually.
- **Audience:** Arabic-speaking customers (prices in shekel ₪).

## 2. Confirmed Decisions

| Decision | Choice | Why |
|---|---|---|
| Language | **Arabic only, RTL layout** | Matches the customer base; fastest to launch |
| Framework | **React 18 + Vite** | Ideal for an animation-heavy showcase SPA; simple dev loop |
| Styling | **Tailwind CSS** | Fast iteration, good RTL support |
| Routing | **React Router** | Category pages, product detail pages |
| Animations | **Framer Motion + GSAP** | Interactive, mouse-reactive, scroll-driven effects |
| Hero video | **Higgsfield (AI-generated clip)** | Cinematic looping background for the homepage hero |
| Hero approach | **Both combined** | AI video background + interactive layer on top (light reflections, floating elements reacting to the mouse) |
| Product data | **Extracted from the supplier invoice PDF** (`شهد - محمد شكارنة.pdf`, ~130 items) | Real catalog to start with; photos/prices refined later |
| Hosting | **Deferred** — will be discussed at the very end | User's explicit request |

**Ruled out:** Remotion — it renders video *files* with React; it is not a tool for
interactive websites. Not needed here.

## 3. What We WANT (features)

### Pages
- **Home (welcome page)**
  - Animated hero: a girl's face with light reflecting (e.g., from glasses), subtle idle
    motion (e.g., hand resting on cheek), parallax reaction to mouse movement, motion
    continues during scroll.
  - Welcome messages + short beauty/body-care messages (skincare tips, self-care themes).
  - Featured products section.
- **Products** (with header dropdown — appears immediately on hover):
  - Face Products (منتجات الوجه)
  - Body Products (منتجات الجسم)
  - Hair Products (منتجات الشعر)
  - Perfumes (العطور)
  - **All Products** — every product on a single page.
- **Product detail** — name, brand, retail price, image(s), description, **how to use**,
  WhatsApp order button.
- **About / Contact** — store story, WhatsApp contact, social links (TBD).

### Site-wide
- **WhatsApp deep links** on every product: `https://wa.me/<NUMBER>?text=<pre-filled Arabic message with product name>`.
- **Animations everywhere, but professional:** scroll reveals, hover effects, smooth page
  transitions, animated dropdown. Target 60fps; subtle and elegant, never noisy.
- **Copyright notice** in the footer: `© 2026 Lolo — جميع الحقوق محفوظة`.
- **Mobile-first responsive design** (most customers will come from phones/Instagram/WhatsApp).

## 4. What We DO NOT Want

- ❌ Payment gateway, cart, or checkout of any kind.
- ❌ User accounts / login.
- ❌ **Showing wholesale invoice prices.** The prices in the supplier PDF are *purchase*
  prices (e.g., hand cream at 4 ₪). They must NEVER appear on the site. Retail prices
  come from the store owner.
- ❌ Hosting/deployment decisions right now — end of project only.
- ❌ Over-engineering: no backend/database for now. Catalog is a local JSON file.

## 5. Product Catalog Spec

- **Source:** `شهد - محمد شكارنة.pdf` (supplier invoice, ~130 line items: makeup, skincare,
  perfumes, hair & body care, razors, lotions...).
- **Target file:** `src/data/products.json`.
- **Schema per product:**

```json
{
  "id": "mk6912",
  "code": "MK6912",
  "nameAr": "كريم يدين بالبابايا WOKALI ووكالي 120 مل",
  "brand": "WOKALI",
  "category": "body",
  "size": "120 مل",
  "retailPrice": null,
  "image": "/images/products/mk6912.jpg",
  "description": "",
  "howToUse": "",
  "featured": false
}
```

- **Categories:** `face` | `body` | `hair` | `perfume` | `other`
  (mapping from item names: مسكارة/اي شدو/بلشر/كريم اساس → face; لوشن/ستيك/شاور جل → body;
  عطر/مسك → perfume; شامبو/عطر شعر → hair; شفرات/فوط → other — final mapping reviewed with user).
- `retailPrice: null` until the owner provides retail prices — products without a price
  show "تواصل معنا للسعر" (contact us for price).
- Product photos: invoice thumbnails are low quality → real photos provided later; use
  elegant placeholders meanwhile.

## 6. Design Direction

- **Palette:** elegant, feminine, beauty-oriented (soft pink / rose gold / cream candidates) —
  exact colors **TBD together with the user**.
- **Arabic fonts (candidates):** Tajawal, Cairo, El Messiri — choose during Phase 1.
- **Animation principles:** smooth, professional, subtle; entrance animations on scroll;
  micro-interactions on hover; consistent timing/easing across the site.

## 7. Roadmap (each phase starts ONLY after consulting the user)

- **Phase 0 — Setup:** install Node.js LTS + Git + VS Code; `git init`; scaffold Vite +
  React project; install Tailwind, Framer Motion, GSAP, React Router.
- **Phase 1 — Skeleton:** RTL + Arabic font setup; header with hover dropdown; footer with
  copyright; page routing; base layout.
- **Phase 2 — Catalog:** extract products from the PDF → `products.json`; category pages;
  All Products page; product detail page; WhatsApp buttons.
- **Phase 3 — Animations & Hero:** Higgsfield hero video + interactive GSAP/Framer Motion
  layer (mouse parallax, light effects); site-wide scroll/hover/transition animations.
- **Phase 4 — Polish:** welcome/care messages content, featured products, refinements,
  performance pass.
- **Phase 5 — Hosting:** discussed at the very end (options: Vercel, Netlify, Cloudflare
  Pages — all have free tiers).

**Status:** ✅ CLAUDE.md created · ⬜ Phase 0 · ⬜ Phase 1 · ⬜ Phase 2 · ⬜ Phase 3 · ⬜ Phase 4 · ⬜ Phase 5

## 8. Working Agreements

- **Always consult the user before implementing anything.** Discuss step by step, one point
  at a time. No big unilateral changes.
- **Git is run by the user himself** — Claude provides the exact commands and explains them;
  the user types them (he wants to learn Git).
- Not everything must be finished in one day — essentials first, refinements later.
- Keep this file updated after every significant decision.

### Git cheat-sheet (for the user to run)

```bash
git init                      # start the repository (once)
git status                    # see what changed
git add .                     # stage all changes
git commit -m "message"       # save a snapshot
git log --oneline             # view history
git checkout -b feature-x     # create + switch to a new branch
git switch master             # go back to the main branch
```

## 9. What the User Must Provide

| Item | Status | Needed for |
|---|---|---|
| WhatsApp order number (invoice mentions 0598922405 — **confirm it's the right one**) | ⬜ pending | Phase 2 |
| Retail prices for products | ⬜ pending | Phase 2+ |
| Real product photos | ⬜ later | Phase 2+ (placeholders OK meanwhile) |
| Logo (if one exists) or approval to design a text logo | ⬜ pending | Phase 1 |
| Higgsfield hero video clip (girl's face, subtle motion) | ⬜ later | Phase 3 |
| Store social media links (Instagram etc.), if any | ⬜ pending | Phase 1/4 |

## 10. Open Questions (to decide together)

1. Final color palette + font choice.
2. Logo: existing, or design a simple elegant text logo "Lolo / لولو"?
3. Domain name (relevant only at hosting time).
4. Which products to feature on the homepage.
5. Exact wording of the welcome & body-care messages.
6. Should razors/pads/misc items (`other` category) appear on the site or be skipped?
