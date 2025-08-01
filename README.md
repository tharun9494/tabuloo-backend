# Razorpay Payment Backend

A complete Express.js backend for Razorpay payment integration with support for both local development and Vercel deployment.

## Features

- ✅ Create payment orders
- ✅ Verify payment signatures
- ✅ Fetch payment details
- ✅ Fetch order details
- ✅ Webhook handling for payment notifications
- ✅ CORS support for frontend integration
- ✅ Environment-based configuration
- ✅ Error handling and logging
- ✅ Support for both local development and Vercel deployment

## Project Structure

```
forefight-health-backend/
├── index.js                 # Local development server
├── routes/
│   └── payment.js          # Payment routes (CommonJS)
├── api/                    # Vercel deployment (ES modules)
│   ├── index.js
│   └── payment/
│       ├── cors.js
│       ├── create-order.js
│       ├── verify-payment.js
│       ├── payment.js
│       ├── order.js
│       └── webhook.js
├── package.json
└── vercel.json
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Local Development (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/payment/create-order` | Create payment order |
| POST | `/api/payment/verify-payment` | Verify payment signature |
| GET | `/api/payment/payment/:paymentId` | Get payment details |
| GET | `/api/payment/order/:orderId` | Get order details |
| POST | `/api/payment/webhook` | Handle webhook notifications |

### Vercel Deployment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/payment/create-order` | Create payment order |
| POST | `/api/payment/verify-payment` | Verify payment signature |
| GET | `/api/payment/payment` | Get payment details |
| GET | `/api/payment/order` | Get order details |
| POST | `/api/payment/webhook` | Handle webhook notifications |

## API Usage Examples

### 1. Create Order

```javascript
// Frontend code
const createOrder = async (amount) => {
  const response = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount, // Amount in rupees
      currency: 'INR',
      receipt: 'order_receipt_123',
      notes: {
        description: 'Payment for services'
      }
    })
  });
  
  const data = await response.json();
  return data;
};
```

### 2. Initialize Razorpay Payment

```javascript
// Frontend code
const initializePayment = async (orderData) => {
  const options = {
    key: orderData.key_id,
    amount: orderData.order.amount,
    currency: orderData.order.currency,
    name: 'Your Company Name',
    description: 'Payment for services',
    order_id: orderData.order.id,
    handler: function (response) {
      // Handle successful payment
      verifyPayment(response);
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
  
  const rzp = new Razorpay(options);
  rzp.open();
};
```

### 3. Verify Payment

```javascript
// Frontend code
const verifyPayment = async (response) => {
  const verificationResponse = await fetch('/api/payment/verify-payment', {
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
  
  const verificationData = await verificationResponse.json();
  
  if (verificationData.success) {
    console.log('Payment verified successfully!');
    // Handle successful payment
  } else {
    console.log('Payment verification failed!');
    // Handle failed payment
  }
};
```

### 4. Get Payment Details

```javascript
// Frontend code
const getPaymentDetails = async (paymentId) => {
  const response = await fetch(`/api/payment/payment/${paymentId}`);
  const data = await response.json();
  return data;
};
```

## Installation & Setup

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your Razorpay credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. The server will run on `http://localhost:3001`

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`

## Webhook Configuration

1. In your Razorpay dashboard, configure webhook URL:
   - **Local**: `http://localhost:3000/api/payment/webhook`
   - **Production**: `https://your-domain.vercel.app/api/payment/webhook`

2. Set the webhook secret in your environment variables

3. The webhook will handle these events:
   - `payment.captured`
   - `payment.failed`

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Missing required parameters
- **405 Method Not Allowed**: Invalid HTTP method
- **500 Internal Server Error**: Server-side errors

All responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

## Security Features

- ✅ CORS configuration for frontend integration
- ✅ Payment signature verification
- ✅ Webhook signature verification
- ✅ Environment variable protection
- ✅ Input validation
- ✅ Error logging

## Testing

### Test Endpoints

1. **Health Check**: `GET /health` or `GET /api/health`
2. **Create Test Order**: Use the create-order endpoint with test amounts
3. **Verify Test Payment**: Use Razorpay test payment IDs

### Test Cards (Razorpay Test Mode)

- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Dependencies

- `express`: Web framework
- `razorpay`: Razorpay SDK
- `crypto`: Node.js crypto module
- `cors`: CORS middleware
- `body-parser`: Request body parsing
- `dotenv`: Environment variable management

## License

MIT License