import { useEffect } from 'react';

export default function DonationHider() {
  useEffect(() => {
    // Remove Stripe elements
    const removeStripeElements = () => {
      const scripts = document.querySelectorAll('script[src*="stripe"], script[src*="m.stripe.com"], script[src*="js.stripe.com"]');
      scripts.forEach(script => script.remove());
      
      const iframes = document.querySelectorAll('iframe[src*="stripe"], iframe[name*="stripe"]');
      iframes.forEach(iframe => iframe.remove());
      
      if (window.Stripe) {
        delete window.Stripe;
      }
      if (window.__stripe) {
        delete window.__stripe;
      }
    };

    removeStripeElements();
    
    const observer = new MutationObserver(() => {
      removeStripeElements();
    });
    
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}