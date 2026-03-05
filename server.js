import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PESAPAL_CONFIG = {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "7uevkJ8S3QCGhwstxv0Gnj19kWaCi+4h",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "YzuyY88DZvgbx5MM1PuHks9VDwc=",
    baseUrl: process.env.PESAPAL_BASE_URL || "https://pay.pesapal.com/v3",
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- HELPER FUNCTIONS ---
async function getPesapalToken() {
    const res = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            consumer_key: PESAPAL_CONFIG.consumerKey,
            consumer_secret: PESAPAL_CONFIG.consumerSecret,
        }),
    });
    if (!res.ok) throw new Error("Failed to authenticate with PesaPal");
    const data = await res.json();
    return data.token;
}

async function registerIpn(authToken, originUrl) {
    const ipnUrl = process.env.IPN_CALLBACK_URL || `${originUrl}/api/pesapal-ipn`;

    const res = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/URLSetup/RegisterIPN`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            url: ipnUrl,
            ipn_notification_type: "GET"
        }),
    });
    const data = await res.json();
    return data.ipn_id;
}


// --- ENDPOINTS ---

// 1. Checkout Endpoint
app.post('/api/pesapal-checkout', async (req, res) => {
    try {
        const { plan, price, type, email, userId, requestId, origin } = req.body;

        if (!plan || !price || !type || !email || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const match = String(price).match(/[0-9.]+/);
        const numericPrice = match ? parseFloat(match[0]) : 0;
        const authToken = await getPesapalToken();

        // Register IPN securely
        // Replace localhost origin with a mock ngrok domain for Pesapal to accept if needed,
        // though Pesapal accepts localhost:3001 as a string (it just won't be able to hit it back).
        const serverOrigin = origin || "http://localhost:3001";
        const ipnId = await registerIpn(authToken, serverOrigin);

        let reference = `PIPTOPIP-${type.toUpperCase()}-${userId}-${Date.now()}`;
        if (requestId) {
            reference += `_REQ_${requestId}`;
        }

        // React Router Dashboard callback
        const callbackUrl = `http://localhost:5173/dashboard?tab=${type === 'Copytrading' ? 'overview&action=connect' : type === 'Algorithm' ? 'custombuilds' : 'downloads'}&status=success&ref=${reference}`;

        let requestBody = {
            id: reference,
            currency: "USD",
            amount: numericPrice,
            description: `${plan} - ${type}`,
            callback_url: callbackUrl,
            notification_id: ipnId,
            billing_address: {
                email_address: email,
                first_name: "User",
                last_name: userId.substring(0, 5),
                country_code: "US"
            },
        };

        // Inject Subscriptions Logic dynamically for copytrading
        if (type === 'Copytrading') {
            const today = new Date();
            const formatPesapalDate = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;

            const startStr = formatPesapalDate(today);
            const endDate = new Date(today);
            endDate.setFullYear(today.getFullYear() + 5);
            const endStr = formatPesapalDate(endDate);

            requestBody.account_number = userId;
            requestBody.subscription_details = {
                start_date: startStr,
                end_date: endStr,
                frequency: "MONTHLY"
            };
        }

        const orderResponse = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/Transactions/SubmitOrderRequest`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            return res.status(500).json({ error: orderData.error?.message || "Failed to create payment link" });
        }

        return res.status(200).json({
            redirect_url: orderData.redirect_url,
            order_reference: reference
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        return res.status(500).json({ error: error.message });
    }
});


// 2. IPN Webhook Listener
app.all('/api/pesapal-ipn', async (req, res) => {
    try {
        let orderTrackingId = req.query.OrderTrackingId || req.body?.OrderTrackingId;
        let orderNotificationType = req.query.OrderNotificationType || req.body?.OrderNotificationType;
        let orderMerchantReference = req.query.OrderMerchantReference || req.body?.OrderMerchantReference;

        if (!orderTrackingId || !orderNotificationType) {
            return res.status(400).send("Missing order metadata in IPN");
        }

        const authToken = await getPesapalToken();

        const statusRes = await fetch(
            `${PESAPAL_CONFIG.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`,
                }
            }
        );
        const txData = await statusRes.json();

        if (txData.payment_status_description?.toUpperCase() === 'COMPLETED') {
            if (orderMerchantReference && orderMerchantReference.startsWith("PIPTOPIP-")) {

                // Parse potential _REQ_ payload for custom EAs
                const refParts = orderMerchantReference.split('_REQ_');
                const baseReference = refParts[0];
                const customRequestId = refParts[1];

                const parts = baseReference.split('-');
                const type = parts[1];
                const actualUserId = parts.slice(2, parts.length - 1).join('-');

                // Mark Custom Build logic if attached
                if (customRequestId) {
                    if (type === 'CONSULTATION') {
                        await supabase.from('consultations')
                            .update({ status: 'scheduled' })
                            .eq('id', customRequestId);
                    } else {
                        await supabase.from('custom_build_requests')
                            .update({ status: 'paid_reviewing' })
                            .eq('id', customRequestId);
                    }
                }

                if (orderNotificationType === "RECURRING" || txData.subscription_transaction_info) {
                    await supabase.from('user_purchases').insert({
                        user_id: actualUserId,
                        product_name: "Recurring Copytrading Plan Validation",
                        product_type: "Copytrading",
                        download_url: null
                    });
                } else {
                    const typeFormatted = type === 'COPYTRADING' ? 'Copytrading' : type === 'COURSE' ? 'Course' : 'Algorithm';
                    await supabase.from('user_purchases').insert({
                        user_id: actualUserId,
                        product_name: txData.description || "Digital Delivery",
                        product_type: typeFormatted,
                        download_url: typeFormatted !== 'Copytrading' ? "https://example.com/secure-download" : null
                    });
                }
            }
        }
    }
        } else if (txData.payment_status_description?.toUpperCase() === 'FAILED' || txData.payment_status_description?.toUpperCase() === 'INVALID') {
    if (orderMerchantReference && orderMerchantReference.startsWith("PIPTOPIP-")) {
        const refParts = orderMerchantReference.split('_REQ_');
        const baseReference = refParts[0];
        const parts = baseReference.split('-');
        const type = parts[1];
        const actualUserId = parts.slice(2, parts.length - 1).join('-');

        // If a recurring copytrading payment fails, aggressively disable their connected accounts
        if (type === 'COPYTRADING' || orderNotificationType === "RECURRING" || txData.subscription_transaction_info) {
            await supabase.from('copytrading_accounts')
                .update({ status: 'disabled' })
                .eq('user_id', actualUserId);
        }
    }
}

return res.status(200).json({
    orderNotificationType: orderNotificationType,
    orderTrackingId: orderTrackingId,
    orderMerchantReference: orderMerchantReference,
    status: 200
});

    } catch (err) {
    console.error("IPN Parse Error:", err.message);
    return res.status(500).json({
        orderNotificationType: "RECURRING",
        orderTrackingId: "",
        orderMerchantReference: "",
        status: 500
    });
}
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`PesaPal Backend securely running on http://localhost:${PORT}`);
});
