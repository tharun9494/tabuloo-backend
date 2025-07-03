# Razorpay Express Backend

A complete Express.js backend for Razorpay payment gateway integration.

## Features

- **Order Creation**: Create payment orders with Razorpay
- **Payment Verification**: Verify payment signatures securely
- **Payment Details**: Fetch payment and order information
- **Webhook Support**: Handle payment notifications
- **Error Handling**: Comprehensive error handling and logging
- **CORS Ready**: Pre-configured for frontend integration

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with your Razorpay credentials:
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   PORT=3000
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### Create Order
```
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 500,
  "currency": "INR",
  "receipt": "order_001",
  "notes": {
    "customer": "John Doe"
  }
}
```

### Verify Payment
```
POST /api/payment/verify-payment
Content-Type: application/json

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

### Get Payment Details
```
GET /api/payment/payment/:paymentId
```

### Get Order Details
```
GET /api/payment/order/:orderId
```

### Webhook
```
POST /api/payment/webhook
```

## Frontend Integration

Here's how to integrate with your frontend:

```javascript
// Create order
const createOrder = async (amount) => {
  const response = await fetch('http://localhost:3000/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount })
  });
  return response.json();
};

// Initialize Razorpay
const initializeRazorpay = (orderData) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Handle payment
const handlePayment = async (amount) => {
  const res = await initializeRazorpay();
  if (!res) {
    alert('Razorpay SDK failed to load');
    return;
  }

  const orderData = await createOrder(amount);
  
  const options = {
    key: orderData.key_id,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: 'Your Company',
    description: 'Payment for order',
    order_id: orderData.order.id,
    handler: async (response) => {
      // Verify payment
      const verifyResponse = await fetch('http://localhost:3000/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });
      
      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        alert('Payment successful!');
      } else {
        alert('Payment verification failed!');
      }
    },
    prefill: {
      name: 'Customer Name',
      email: 'customer@example.com',
      contact: '9999999999'
    },
    theme: {
      color: '#3399cc'
    }
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
```

## Testing

1. Use Razorpay test keys for development
2. Test with Razorpay test card numbers
3. Check webhook events in Razorpay dashboard

## Security Notes

- Always verify payment signatures on the backend
- Never expose your key_secret to the frontend
- Use HTTPS in production
- Implement rate limiting for production use

## Support

For issues related to Razorpay integration, check the [Razorpay documentation](https://razorpay.com/docs/).