import OpenAI from "openai";
import fetch from "node-fetch";

// -----------------------
// 1. CONFIGURATION
// -----------------------
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
const WHATSAPP_TOKEN = "YOUR_WHATSAPP_CLOUD_API_TOKEN";
const PHONE_NUMBER_ID = "YOUR_WHATSAPP_PHONE_NUMBER_ID"; // from Meta Developer Console
const CUSTOMER_PHONE = "91XXXXXXXXXX"; // international format

// Customer service configuration
const serviceConfig = {
  businessName: "Your Business Name",
  serviceHours: "9:00 AM - 6:00 PM (Monday to Friday)",
  weekendHours: "10:00 AM - 4:00 PM (Saturday)",
  contactEmail: "support@yourbusiness.com",
  website: "https://yourbusiness.com",
  supportPhone: "+1-800-SUPPORT"
};

// Current offers and promotions
const currentOffers = [
  "20% off on first service",
  "Free consultation for new customers",
  "Weekend special rates available"
];

// -----------------------
// 2. GENERATE CUSTOMER SERVICE RESPONSE WITH CHATGPT
// -----------------------
async function generateCustomerServiceResponse(customerQuery, customerName = "there") {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const prompt = `You are a helpful customer service representative for ${serviceConfig.businessName}. 
  
  Customer Query: "${customerQuery}"
  Customer Name: ${customerName}
  
  Business Information:
  - Service Hours: ${serviceConfig.serviceHours}
  - Weekend Hours: ${serviceConfig.weekendHours}
  - Contact: ${serviceConfig.contactEmail}
  - Website: ${serviceConfig.website}
  
  Current Offers: ${currentOffers.join(", ")}
  
  Please provide a helpful, professional response that:
  1. Addresses their specific query
  2. Includes relevant business hours if they ask about availability
  3. Mentions relevant offers if applicable
  4. Keeps it friendly and under 100 words
  5. Ends with a helpful next step or contact information`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

// -----------------------
// 3. SEND TEXT MESSAGE VIA WHATSAPP
// -----------------------
async function sendWhatsAppTextMessage(text) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: CUSTOMER_PHONE,
    type: "text",
    text: { body: text }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Text Message Response:", data);
  return data;
}

// -----------------------
// 4. SEND MESSAGE WITH CLICKABLE BUTTONS
// -----------------------
async function sendWhatsAppButtonMessage(text, buttons) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: CUSTOMER_PHONE,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: text
      },
      action: {
        buttons: buttons
      }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Button Message Response:", data);
  return data;
}

// -----------------------
// 5. SEND MESSAGE WITH CLICKABLE LINK
// -----------------------
async function sendWhatsAppLinkMessage(text, linkText, url) {
  const messageWithLink = `${text}\n\n${linkText}: ${url}`;
  
  // For links, we send as text message since WhatsApp doesn't have a dedicated link type
  // The link will be automatically clickable in WhatsApp
  return await sendWhatsAppTextMessage(messageWithLink);
}

// -----------------------
// 6. SEND QUICK REPLY OPTIONS
// -----------------------
async function sendQuickReplyMessage(text, quickReplies) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: CUSTOMER_PHONE,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: text
      },
      action: {
        buttons: quickReplies.map((reply, index) => ({
          type: "reply",
          reply: {
            id: `quick_reply_${index}`,
            title: reply
          }
        }))
      }
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Quick Reply Response:", data);
  return data;
}

// -----------------------
// 7. MAIN CUSTOMER SERVICE FUNCTIONS
// -----------------------
async function handleServiceAvailabilityQuery(customerName) {
  const query = "What are your service hours and availability?";
  const response = await generateCustomerServiceResponse(query, customerName);
  
  // Send text response first
  await sendWhatsAppTextMessage(response);
  
  // Send quick reply options for follow-up
  await sendQuickReplyMessage(
    "How else can I help you today?",
    ["Book Appointment", "Current Offers", "Contact Support", "Visit Website"]
  );
}

async function handleOffersQuery(customerName) {
  const query = "What offers and promotions do you currently have?";
  const response = await generateCustomerServiceResponse(query, customerName);
  
  // Send text response
  await sendWhatsAppTextMessage(response);
  
  // Send buttons for actions
  const buttons = [
    {
      type: "url",
      url: `${serviceConfig.website}/offers`,
      title: "View All Offers"
    },
    {
      type: "phone_number",
      phone_number: serviceConfig.supportPhone,
      title: "Call Support"
    }
  ];
  
  await sendWhatsAppButtonMessage(
    "Would you like to learn more about our offers or speak with someone?",
    buttons
  );
}

async function sendWebsiteLink(customerName) {
  const message = `Hi ${customerName}! Here's our website where you can learn more about our services:`;
  await sendWhatsAppLinkMessage(message, "Visit Website", serviceConfig.website);
}

// -----------------------
// 8. MAIN EXECUTION EXAMPLE
// -----------------------
(async () => {
  try {
    console.log("🤖 Customer Service Bot Starting...");
    
    // Example: Handle service availability query
    await handleServiceAvailabilityQuery("John");
    
    // Wait a bit before sending next message
    setTimeout(async () => {
      // Example: Send offers information
      await handleOffersQuery("John");
    }, 2000);
    
    console.log("✅ Customer service messages sent successfully!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();

// Export functions for external use
export {
  generateCustomerServiceResponse,
  sendWhatsAppTextMessage,
  sendWhatsAppButtonMessage,
  sendWhatsAppLinkMessage,
  sendQuickReplyMessage,
  handleServiceAvailabilityQuery,
  handleOffersQuery,
  sendWebsiteLink
}; 