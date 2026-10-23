# FORM/SHIFT landing page

A responsive, conversion-focused storefront concept for original 3D-printed desk objects.

## Open locally

Double-click `index.html`, or run a local server from this folder:

```bash
python3 -m http.server 4177
```

Then open `http://127.0.0.1:4177`.

## Included

- Interactive Three.js hero object with drag rotation and colour controls
- Responsive product catalog and category filters
- Product detail dialogs
- Persistent shopping bag using `localStorage`
- Order-request flow that generates a copyable WhatsApp-ready summary
- Mobile navigation, keyboard focus states and reduced-motion support
- All product visuals generated with HTML/CSS/JavaScript; no stock imagery

## Before publishing

1. Replace the draft `FORM/SHIFT` name if you have a final business name.
2. Update product names, prices and descriptions in `index.html` and the `PRODUCTS` object in `app.js`.
3. Replace the blank footer `mailto:` link with your real business email.
4. Connect the checkout button to your real WhatsApp number, ecommerce service or backend. The current version deliberately creates a copyable order request instead of sending customer information anywhere.
5. Confirm shipping fees, production times, refund policy, privacy policy and business contact details.
6. Replace draft product specifications with dimensions and materials verified against the products you actually sell.

## Files

- `index.html` — content and structure
- `styles.css` — full visual system and responsive layout
- `app.js` — storefront interactions, cart and 3D scene
- `three.min.js` — locally bundled Three.js r160.1
