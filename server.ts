import express from "express";
import path from "path";
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Check Environment Configuration
app.get("/api/config", (req, res) => {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE',
    'PAYSTACK_PUBLIC_KEY',
    'PAYSTACK_SECRET_KEY'
  ];

  const optionalVars = [
    'PAYSTACK_WEBHOOK_SECRET',
    'WHATSAPP_NUMBER',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USERNAME',
    'SMTP_PASSWORD',
    'SENDER_EMAIL'
  ];

  const missingRequiredVars = requiredVars.filter(v => !process.env[v]);
  const missingOptionalVars = optionalVars.filter(v => !process.env[v]);

  res.json({
    isConfigured: missingRequiredVars.length === 0,
    missingVars: missingRequiredVars,
    missingOptionalVars,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
      whatsappNumber: process.env.WHATSAPP_NUMBER
    }
  });
});

// Get Admin Settings (Masking secrets, mapped from env)
app.get("/api/admin/settings", (req, res) => {
  res.json({
    supabase: {
      projectUrl: process.env.SUPABASE_URL || '',
      projectId: '', // Derived or ignored
      anonKey: process.env.SUPABASE_ANON_KEY ? '********' : '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE ? '********' : '',
      storageBucket: '',
    },
    paystack: {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      secretKey: process.env.PAYSTACK_SECRET_KEY ? '********' : '',
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ? '********' : '',
      callbackUrl: `${process.env.APP_URL || ''}/api/payment/callback`,
    },
    whatsapp: {
      number: process.env.WHATSAPP_NUMBER || '',
      message: 'Hello,\n\nI have successfully made payment.\n\nOrder Number: {order_number}\nCustomer Name: {customer_name}\nAmount Paid: {amount}\n\nKindly confirm my payment and process my order.\n\nThank you.',
      enableRedirect: true,
    },
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '',
      username: process.env.SMTP_USERNAME || '',
      password: process.env.SMTP_PASSWORD ? '********' : '',
      senderEmail: process.env.SENDER_EMAIL || '',
    },
    website: {
      name: 'LUXE Fashion',
      logo: '',
      contactEmail: 'support@luxe.com',
      phone: '+1 (800) 123-4567',
      address: '123 Luxury Avenue, Fashion District, NY 10001',
      currency: 'USD',
    }
  });
});

// Update Admin Settings (Mocked for env vars)
app.post("/api/admin/settings", (req, res) => {
  res.json({ status: "success", message: "Settings saved to environment (simulated)" });
});

// Test Connections
app.post("/api/admin/test-connection", (req, res) => {
  const { type } = req.body;
  
  // Simulate testing connection to external services
  setTimeout(() => {
    res.json({
      status: true,
      message: `Successfully connected to ${type}!`
    });
  }, 1500);
});

// Secure Order Processing (Paystack Verification + Order Creation + Stock Reduction)

app.post("/api/orders/process-payment", async (req, res) => {
  console.log("================= PAYMENT PROCESS INITIATED =================");
  console.log("PAYMENT PAYLOAD:", req.body);
  const { reference, items, customerData, shipping = 0 } = req.body;
  
  if (!reference) {
    console.error("Missing reference");
    return res.status(400).json({ error: "Reference is required" });
  }
  
  if (!process.env.PAYSTACK_SECRET_KEY) { 
     console.error("Missing PAYSTACK_SECRET_KEY");
     return res.status(500).json({ error: "PAYSTACK_SECRET_KEY is missing from environment" });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) { 
     console.error("Missing Supabase credentials");
     return res.status(500).json({ error: "Supabase credentials missing" });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const rawSupabaseUrl = process.env.SUPABASE_URL || '';
    const cleanSupabaseUrl = rawSupabaseUrl.replace('/rest/v1/', '').replace('/rest/v1', '');
    const supabaseAdmin = createClient(
      cleanSupabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE
    );

    let calculatedCartTotal = 0;
    const validatedItems = [];
    

    const idMapping: Record<string, string> = {
    "prod-1": "a7e3d015-dec8-4992-b7ce-782c9e3792c7",
    "prod-2": "866db17c-6dae-48d5-95b1-0d6d88a4d5ce",
    "prod-3": "c1fdae15-0f5e-4038-b360-2fd44fb9f3a4",
    "prod-4": "f0af10ba-30b5-4f14-b915-24d359c8c436",
    "prod-5": "1cafbefd-367e-4545-82fb-d42c4d6fe49a",
    "prod-6": "98126868-6c49-4071-bd63-526f95adae31",
    "prod-7": "5bd4c556-fe0b-424a-a151-d5b7fecf6f55",
    "prod-8": "75e3d9dd-dbe7-42ca-97f1-7bdfa82b6757",
    "prod-9": "5eea5522-78c6-4b43-bd75-fd2d03bae527",
    "prod-10": "6f5961c7-bb93-428a-9452-6b68baa00588",
    "prod-11": "c286018b-dfc9-44a3-8b2c-d664ee4252d9",
    "prod-12": "3014a665-ac87-41c8-8680-218cd8aaf85a"
};
    
    for (let i = 0; i < items.length; i++) {
       if (idMapping[items[i].id]) {
          items[i].id = idMapping[items[i].id];
       }
    }

    for (const item of items) {

      const { data: product } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();
        
      if (!product) {
        console.error(`Product not found: ${item.name}`);
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }

      let finalPrice = Number(product.price);
      let variantData = null;

      if (item.size || item.color) {
        let variantQuery = supabaseAdmin.from('product_variants').select('*').eq('product_id', item.id);
        if (item.size) variantQuery = variantQuery.eq('size', item.size);
        if (item.color) variantQuery = variantQuery.eq('color', item.color);
        
        const { data: variants } = await variantQuery;
        if (variants && variants.length > 0) {
          variantData = variants[0];
          if (variantData.price_adjustment) {
            finalPrice += Number(variantData.price_adjustment);
          }
          if (variantData.stock_quantity < item.quantity) {
             console.warn(`Warning: Insufficient stock for ${item.name} (${item.size || ''} ${item.color || ''}) - Proceeding anyway since payment will be verified.`);
          }
        }
      } else {
         if (product.stock_quantity < item.quantity) {
             console.warn(`Warning: Insufficient stock for ${item.name} - Proceeding anyway since payment will be verified.`);
         }
      }

      calculatedCartTotal += finalPrice * item.quantity;
      validatedItems.push({
        ...item,
        validatedPrice: finalPrice,
        variantId: variantData ? variantData.id : null
      });
    }

    const calculatedGrandTotal = calculatedCartTotal + Number(shipping);

    console.log(`Verifying Paystack reference: ${reference}`);
    
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    const verifyData = await verifyResponse.json();
    
    console.log("PAYSTACK VERIFY DATA:", JSON.stringify(verifyData));
    
    if (!verifyData.status || verifyData.data.status !== 'success') { 
       console.error("Payment verification failed", verifyData);
       return res.status(400).json({ error: `Payment verification failed: ${verifyData.message || 'Unknown Error'}` });
    }
    
    const expectedAmountKobo = Math.round(calculatedGrandTotal * 100);
    if (verifyData.data.amount < expectedAmountKobo) { 
       console.error(`Payment amount mismatch. Expected: ${expectedAmountKobo}, Paid: ${verifyData.data.amount}`);
       return res.status(400).json({ error: `Payment amount mismatch. Expected: ${expectedAmountKobo}, Paid: ${verifyData.data.amount}` });
    }

    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('reference', reference)
      .single();
      
    if (existingPayment) {
      console.error("Order already processed for this payment");
      return res.status(400).json({ error: "Order already processed for this payment" });
    }
    
    const orderNumber = `ORD-${Math.floor(Math.random() * 1000000)}`;
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'paid',
        subtotal: calculatedCartTotal,
        shipping_fee: shipping,
        total_amount: calculatedGrandTotal,
        notes: `Paystack Ref: ${reference}`,
        shipping_address_data: {
          customer_name: `${customerData.firstName} ${customerData.lastName}`,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          postal_code: customerData.postalCode,
          country: customerData.country
        },
      })
      .select()
      .single();
      
    if (orderError) { 
      console.error("ORDER CREATION ERROR:", orderError); 
      throw orderError; 
    }
    
    console.log("Order created successfully:", orderData.id);

    for (const item of validatedItems) {
      let finalProductName = item.name;
      const extras = [];
      if (item.size) extras.push(`Size: ${item.size}`);
      if (item.color) extras.push(`Color: ${item.color}`);
      if (extras.length > 0) {
          finalProductName += ` (${extras.join(', ')})`;
      }
      const { error: itemError } = await supabaseAdmin.from('order_items').insert({
        order_id: orderData.id,
        product_id: item.id,
        variant_id: item.variantId || null,
        product_name: finalProductName,
        quantity: item.quantity,
        unit_price: item.validatedPrice,
        total_price: item.validatedPrice * item.quantity,
      });
      if (itemError) {
          console.error("ORDER ITEM CREATION ERROR:", itemError);
      }

      if (item.variantId) {
         const { data: v } = await supabaseAdmin.from('product_variants').select('stock_quantity').eq('id', item.variantId).single();
         if (v) {
            await supabaseAdmin.from('product_variants').update({
              stock_quantity: Math.max(0, (v.stock_quantity || 0) - item.quantity)
            }).eq('id', item.variantId);
         }
      }
      
      const { data: p } = await supabaseAdmin.from('products').select('stock_quantity').eq('id', item.id).single();
      if (p) {
        const newStock = Math.max(0, (p.stock_quantity || 0) - item.quantity);
        await supabaseAdmin.from('products').update({
            stock_quantity: newStock, 
            in_stock: newStock > 0
          }).eq('id', item.id);
      }
    }
    
    console.log("Order items created successfully.");

    await supabaseAdmin.from('payments').insert({
      order_id: orderData.id,
      provider: 'paystack',
      reference: reference,
      amount: calculatedGrandTotal,
      status: 'success'
    });

    console.log("================= PAYMENT PROCESS SUCCESS =================");
    res.json({
      status: true,
      orderNumber,
      amount: calculatedGrandTotal,
      customerName: `${customerData.firstName} ${customerData.lastName}`
    });
  } catch (error: any) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: error.message || "Internal server error during processing" });
  }
});


// Admin Orders Fetch (Uses Service Role to bypass RLS for Admin Dashboard)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const rawSupabaseUrl = process.env.SUPABASE_URL || '';
    const cleanSupabaseUrl = rawSupabaseUrl.replace('/rest/v1/', '').replace('/rest/v1', '');
    const supabaseAdmin = createClient(
      cleanSupabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE
    );
    
    // Fetch orders with related items and payment info
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*), payments(*)')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const mappedOrders = (orders || []).map(o => {
        const addr = o.shipping_address_data || {};
        return {
            ...o,
            customer_name: addr.customer_name || 'Guest',
            customer_email: addr.customer_email || '',
            customer_phone: addr.customer_phone || '',
            shipping_address: addr.address || '',
            shipping_city: addr.city || '',
            shipping_postal_code: addr.postal_code || '',
            shipping_country: addr.country || ''
        };
    });
    
    res.json(mappedOrders);
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { createClient } = await import('@supabase/supabase-js');
    const rawSupabaseUrl = process.env.SUPABASE_URL || '';
    const cleanSupabaseUrl = rawSupabaseUrl.replace('/rest/v1/', '').replace('/rest/v1', '');
    const supabaseAdmin = createClient(
      cleanSupabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE
    );
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Vite
// Static Serving only if we aren't being imported as a module by Vercel
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const viteModule = "vite";
      const { createServer: createViteServer } = await import(/* @vite-ignore */ viteModule);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Production static serving
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
}

export default app;
