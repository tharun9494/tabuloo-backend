// Test script to verify email configuration
// Run this with: node test-email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing email configuration...\n');

  // Check environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.log('\nPlease create a .env.local file with the required SMTP configuration.');
    console.log('See EMAIL_SETUP.md for detailed instructions.');
    return;
  }

  console.log('✅ Environment variables found:');
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || 587}`);
  console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`   SMTP_SECURE: ${process.env.SMTP_SECURE || 'false'}`);
  console.log(`   FROM_EMAIL: ${process.env.FROM_EMAIL || process.env.SMTP_USER}\n`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('🔧 Testing SMTP connection...');

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Test email sending
    console.log('📧 Testing email sending...');

    const testEmail = {
      from: `Test <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Test Email - Restaurant Registration System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the SMTP configuration for the restaurant registration system.</p>
        <p>If you receive this email, the email service is working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);

    console.log('🎉 Email configuration is working correctly!');
    console.log('You can now use the restaurant registration form.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);

    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Solution: Check your SMTP credentials (username/password)');
      console.log('   For Gmail: Make sure you\'re using an App Password, not your regular password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Check SMTP host and port configuration');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Solution: Check SMTP host configuration');
    }

    console.log('\nSee EMAIL_SETUP.md for detailed troubleshooting steps.');
  }
}

// Run the test
testEmail();
