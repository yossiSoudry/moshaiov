'use client';

import { useEffect } from 'react';
import { BrainerceBot } from 'brainerce/bot';
import { SALES_CHANNEL_ID, API_URL } from '@/lib/omni-sync';
import { useCartStore } from '@/store/cart-store';
import { logError } from '@/lib/utils';

/**
 * Mounts Brainerce's AI shopping-assistant chat widget.
 *
 * All visual config (name, avatar, colors, greeting, starter questions,
 * guardrails) lives in the merchant dashboard — `mount` resolves to null and
 * renders nothing until the bot is switched Live there.
 *
 * Cart adds from the widget (card buttons, in-card variant picker, and
 * bot-initiated "add the X to my cart") are routed through our cart store so
 * the header count and cart drawer stay in sync.
 */
export function BrainerceBotWidget() {
  useEffect(() => {
    let bot: BrainerceBot | null = null;
    let cancelled = false;

    BrainerceBot.mount({
      connectionId: SALES_CHANNEL_ID,
      baseUrl: API_URL,
      onAddToCart: async ({ productId, variantId, quantity }) => {
        try {
          await useCartStore
            .getState()
            .addToCart(productId, variantId ?? undefined, quantity);
          // addToCart resets error at start and only sets it on failure.
          return !useCartStore.getState().error;
        } catch (err) {
          logError('Bot add-to-cart error:', err);
          return false;
        }
      },
    })
      .then((instance) => {
        if (cancelled) {
          instance?.destroy();
          return;
        }
        bot = instance;
      })
      .catch((err) => logError('Brainerce bot mount error:', err));

    return () => {
      cancelled = true;
      bot?.destroy();
    };
  }, []);

  return null;
}
