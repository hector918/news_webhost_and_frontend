const express = require("express");
const payment = express.Router();
const stripe = require('stripe')('sk_test_51OH8GpDzSdrnjyOacTyTcCJDEscgnDUDT48GWfiijmoZMk2pMJmta57DB8pTVdzaEY8HthmVnAuVk1VePnFkWMSq00Kk93xHJW');
const YOUR_DOMAIN = ""
//
payment.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: 'payment',
    return_url: `${YOUR_DOMAIN}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: { enabled: true },
  });

  res.send({ clientSecret: session.client_secret });
});

payment.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email
  });
});

module.exports = { payment };


