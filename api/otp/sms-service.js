// Twilio SMS Service
import twilio from 'twilio';

class TwilioSMSService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!this.accountSid || !this.authToken || !this.phoneNumber) {
      console.warn('⚠️ Twilio credentials not configured. SMS will be mocked.');
      this.client = null;
    } else {
      this.client = twilio(this.accountSid, this.authToken);
      console.log(`📱 Twilio initialized with phone number: ${this.phoneNumber}`);
    }
  }

  async sendOTP(phone, otp) {
    if (!this.client) {
      console.log(`📱 [MOCK] Sending OTP ${otp} to ${phone}`);
      console.log(`📱 [MOCK] Message: "Your OTP is: ${otp}. Valid for 5 minutes."`);
      return true;
    }

    try {
      console.log(`📱 Attempting to send SMS to ${phone} from ${this.phoneNumber}`);
      
      const message = await this.client.messages.create({
        body: `Your OTP is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
        from: this.phoneNumber,
        to: phone
      });

      console.log(`✅ SMS sent successfully!`);
      console.log(`📱 Message SID: ${message.sid}`);
      console.log(`📱 Status: ${message.status}`);
      console.log(`📱 To: ${message.to}`);
      console.log(`📱 From: ${message.from}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${phone}:`);
      console.error(`❌ Error Code: ${error.code}`);
      console.error(`❌ Error Message: ${error.message}`);
      
      // Common Twilio error codes
      if (error.code === 21211) {
        console.error(`❌ TRIAL ACCOUNT: Phone number ${phone} is not verified. Please verify it in Twilio Console.`);
      } else if (error.code === 21408) {
        console.error(`❌ TRIAL ACCOUNT: Cannot send to this number. Please verify the number or upgrade your account.`);
      } else if (error.code === 21614) {
        console.error(`❌ Invalid phone number format: ${phone}`);
      }
      
      return false;
    }
  }
}

export default TwilioSMSService;
