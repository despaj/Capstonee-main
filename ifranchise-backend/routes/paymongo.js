const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middleware/auth");
router.use(authenticate);

router.post("/paymongo/create-gcash", async (req, res) => {
  try {
    const { amount, description, orderId } = req.body;
    const amountCentavos = Math.round(parseFloat(amount) * 100);
    if (amountCentavos < 10000)
      return res
        .status(400)
        .json({ error: "Minimum GCash payment via PayMongo is ₱100." });

    const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString(
      "base64",
    );
    const response = await fetch("https://api.paymongo.com/v1/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountCentavos,
            description: description || `POS Order #${orderId}`,
            remarks: `Order #${orderId}`,
          },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok)
      return res
        .status(400)
        .json({ error: data.errors?.[0]?.detail || "PayMongo error" });

    const link = data.data;
    res.json({
      success: true,
      checkoutUrl: link.attributes.checkout_url,
      referenceNo: link.attributes.reference_number,
      linkId: link.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment link" });
  }
});

router.get("/paymongo/link-status/:linkId", async (req, res) => {
  try {
    const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY + ":").toString(
      "base64",
    );
    const response = await fetch(
      `https://api.paymongo.com/v1/links/${req.params.linkId}`,
      {
        headers: { Authorization: `Basic ${auth}` },
      },
    );
    const data = await response.json();
    if (!response.ok)
      return res.status(400).json({ error: "Failed to fetch link status" });

    const attrs = data.data.attributes;
    const payments = attrs.payments || [];
    const lastPayment = payments[payments.length - 1];
    const gcashRef =
      lastPayment?.attributes?.external_reference_number ||
      lastPayment?.id ||
      null;

    res.json({
      success: true,
      status: attrs.status,
      gcashRef,
      amount: attrs.amount / 100,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

module.exports = router;
