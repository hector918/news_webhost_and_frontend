// This is your test secret API key.
const stripe = Stripe("pk_test_51OH8GpDzSdrnjyOaH2NfwQl0AnOHwy62GSArvCKgb2R0eRoS0gEpsP2K9BX9VoG2qizTJmfMaSlTmxVS1xZJAgMf00wiuMtyP6");

initialize();

// Create a Checkout Session
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}