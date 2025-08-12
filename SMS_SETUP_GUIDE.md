# Twilio SMS Service Setup Guide

This project uses Twilio for SMS delivery, providing reliable global SMS service.

## Twilio Setup

### 1. Create Twilio Account
1. Sign up at https://www.twilio.com/try-twilio
2. Verify your email and phone number
3. You'll get $15.50 in trial credits (enough for ~2,000 SMS)

### 2. Get Credentials
1. Go to https://console.twilio.com/
2. Find your **Account SID** and **Auth Token**
3. Get a Twilio phone number from Console → Phone Numbers

### 3. Update Environment Variables
Add these to your `.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Install Dependencies
```bash
npm install twilio
```

## Testing

Test your SMS configuration:

```bash
node test-otp.js
```

## API Usage

### Send OTP
```javascript
POST /api/otp/send
{
  "identifier": "Twilio_Verified",
  "type": "phone"
}
```

### Verify OTP
```javascript
POST /api/otp/verify
{
  "identifier": "Twilio_Verified", 
  "otp": "123456"
}
```

### Validate Session
```javascript
POST /api/otp/validate-session
{
  "sessionToken": "base64_encoded_token"
}
```

## Features

✅ **Global Coverage**: Send SMS to 180+ countries  
✅ **High Delivery Rate**: 99%+ delivery success  
✅ **Real-time Status**: Track message delivery  
✅ **Trial Credits**: $15.50 free credits  
✅ **Scalable**: Handles high volume  
✅ **Reliable**: Enterprise-grade infrastructure  

## Cost

- **Trial**: $15.50 free credits
- **SMS Cost**: ~$0.0075 per SMS (varies by country)
- **No Monthly Fees**: Pay only for what you use

## Troubleshooting

### Common Issues:

1. **SMS not received**: 
   - Check phone number format (include country code)
   - Verify Twilio credentials
   - Check Twilio console for delivery status

2. **Authentication errors**:
   - Verify Account SID and Auth Token
   - Check .env file formatting
   - Ensure no extra spaces in credentials

3. **Phone number issues**:
   - Use trial phone number for testing
   - Verify phone number in Twilio console
   - Check if number supports SMS

### Debug Steps:
1. Check Twilio console logs
2. Verify environment variables are loaded
3. Test with verified phone numbers first
4. Check account balance/credits

## Production Considerations

1. **Upgrade Account**: Remove trial restrictions
2. **Phone Number**: Get a dedicated number
3. **Rate Limiting**: Implement proper rate limiting
4. **Monitoring**: Set up delivery webhooks
5. **Compliance**: Follow SMS regulations (opt-in/opt-out)

## Support

- Twilio Documentation: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com/
- Console: https://console.twilio.com/
