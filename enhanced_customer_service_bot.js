import OpenAI from "openai";
import fetch from "node-fetch";
import fs from 'fs/promises';

// -----------------------
// 1. CONFIGURATION
// -----------------------
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";
const WHATSAPP_TOKEN = "YOUR_WHATSAPP_CLOUD_API_TOKEN";
const PHONE_NUMBER_ID = "YOUR_WHATSAPP_PHONE_NUMBER_ID";
const CUSTOMER_PHONE = "91XXXXXXXXXX";

// -----------------------
// 2. LOAD Q&A DATA
// -----------------------
async function loadQAData() {
  try {
    const data = await fs.readFile('./customer_service_qa.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading Q&A data:', error);
    return null;
  }
}

// -----------------------
// 3. INTELLIGENT RESPONSE GENERATOR
// -----------------------
async function generateIntelligentResponse(customerQuery, customerName = "there", qaData) {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Find relevant FAQ entries
  const relevantFAQs = qaData.faq.filter(faq => 
    faq.question.toLowerCase().includes(customerQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(customerQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(customerQuery.toLowerCase())
  );

  // Find relevant common inquiries
  const relevantInquiries = qaData.common_inquiries.filter(inquiry =>
    inquiry.keywords.some(keyword => 
      customerQuery.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  const prompt = `You are a helpful customer service representative for ${qaData.business_info.name}. 
  
  Customer Query: "${customerQuery}"
  Customer Name: ${customerName}
  
  Business Information:
  - Service Hours: ${qaData.service_hours.weekdays} and ${qaData.service_hours.weekends}
  - Contact: ${qaData.contact_info.phone} or ${qaData.contact_info.email}
  - Website: ${qaData.contact_info.website}
  
  Current Offers: ${qaData.current_offers.map(o => o.title).join(", ")}
  
  Relevant FAQ Information: ${relevantFAQs.map(faq => `Q: ${faq.question} A: ${faq.answer}`).join('\n')}
  
  Please provide a helpful, professional response that:
  1. Directly addresses their specific query
  2. Uses relevant information from our FAQ if applicable
  3. Includes business hours if they ask about availability
  4. Mentions relevant offers if applicable
  5. Keeps it friendly and under 100 words
  6. Ends with a helpful next step or contact information
  7. If they ask about offers, mention specific current offers`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

// -----------------------
// 4. WHATSAPP MESSAGE FUNCTIONS
// -----------------------
async function sendWhatsAppTextMessage(text, phoneNumberId, whatsappToken, customerPhone) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: customerPhone,
    type: "text",
    text: { body: text }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${whatsappToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Text Message Response:", data);
  return data;
}

async function sendWhatsAppButtonMessage(text, buttons, phoneNumberId, whatsappToken, customerPhone) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: customerPhone,
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
      "Authorization": `Bearer ${whatsappToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Button Message Response:", data);
  return data;
}

async function sendWhatsAppLinkMessage(text, linkText, url, phoneNumberId, whatsappToken, customerPhone) {
  const messageWithLink = `${text}\n\n${linkText}: ${url}`;
  return await sendWhatsAppTextMessage(messageWithLink, phoneNumberId, whatsappToken, customerPhone);
}

async function sendQuickReplyMessage(text, quickReplies, phoneNumberId, whatsappToken, customerPhone) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: customerPhone,
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
      "Authorization": `Bearer ${whatsappToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("WhatsApp Quick Reply Response:", data);
  return data;
}

// -----------------------
// 5. SPECIALIZED CUSTOMER SERVICE FUNCTIONS
// -----------------------
async function handleServiceHoursQuery(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const response = await generateIntelligentResponse("What are your business hours?", customerName, qaData);
  
  // Send text response
  await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
  
  // Send quick reply options
  await sendQuickReplyMessage(
    "How else can I help you today?",
    ["Book Appointment", "Current Offers", "Contact Support", "Visit Website"],
    phoneNumberId, whatsappToken, customerPhone
  );
}

async function handleOffersQuery(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const response = await generateIntelligentResponse("What offers do you have?", customerName, qaData);
  
  // Send text response
  await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
  
  // Send buttons for actions
  const buttons = [
    {
      type: "url",
      url: `${qaData.contact_info.website}/offers`,
      title: "View All Offers"
    },
    {
      type: "phone_number",
      phone_number: qaData.contact_info.phone,
      title: "Call Support"
    }
  ];
  
  await sendWhatsAppButtonMessage(
    "Would you like to learn more about our offers or speak with someone?",
    buttons,
    phoneNumberId, whatsappToken, customerPhone
  );
}

async function handlePricingQuery(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const response = await generateIntelligentResponse("What are your prices?", customerName, qaData);
  
  // Send text response
  await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
  
  // Send website link for detailed pricing
  await sendWhatsAppLinkMessage(
    "For detailed pricing and to get a free estimate, visit our website:",
    "Get Free Estimate",
    `${qaData.contact_info.website}/pricing`,
    phoneNumberId, whatsappToken, customerPhone
  );
}

async function handleBookingQuery(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const response = await generateIntelligentResponse("How do I book an appointment?", customerName, qaData);
  
  // Send text response
  await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
  
  // Send booking buttons
  const buttons = [
    {
      type: "url",
      url: `${qaData.contact_info.website}/booking`,
      title: "Book Online"
    },
    {
      type: "phone_number",
      phone_number: qaData.contact_info.phone,
      title: "Call to Book"
    }
  ];
  
  await sendWhatsAppButtonMessage(
    "Choose your preferred booking method:",
    buttons,
    phoneNumberId, whatsappToken, customerPhone
  );
}

async function sendWelcomeMessage(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const welcomeText = qaData.response_templates.greeting
    .replace('{customer_name}', customerName)
    .replace('{business_name}', qaData.business_info.name);
  
  await sendWhatsAppTextMessage(welcomeText, phoneNumberId, whatsappToken, customerPhone);
  
  // Send quick reply options
  await sendQuickReplyMessage(
    "What would you like to know about?",
    ["Service Hours", "Current Offers", "Pricing", "Book Appointment", "Contact Info"],
    phoneNumberId, whatsappToken, customerPhone
  );
}

// -----------------------
// 6. MAIN CUSTOMER SERVICE HANDLER
// -----------------------
async function handleCustomerInquiry(customerQuery, customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  try {
    // Generate intelligent response
    const response = await generateIntelligentResponse(customerQuery, customerName, qaData);
    
    // Send the main response
    await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
    
    // Send follow-up options
    await sendQuickReplyMessage(
      "Is there anything else I can help you with?",
      ["Service Hours", "Offers", "Pricing", "Book Appointment", "Contact Support"],
      phoneNumberId, whatsappToken, customerPhone
    );
    
    return response;
  } catch (error) {
    console.error('Error handling customer inquiry:', error);
    
    // Send fallback response
    const fallbackResponse = "I apologize, but I'm having trouble processing your request right now. Please call us directly at " + qaData.contact_info.phone + " or email us at " + qaData.contact_info.email + " for immediate assistance.";
    
    await sendWhatsAppTextMessage(fallbackResponse, phoneNumberId, whatsappToken, customerPhone);
    return fallbackResponse;
  }
}

// -----------------------
// 7. MAIN EXECUTION EXAMPLE
// -----------------------
(async () => {
  try {
    console.log("🤖 Enhanced Customer Service Bot Starting...");
    
    // Load Q&A data
    const qaData = await loadQAData();
    if (!qaData) {
      console.error("Failed to load Q&A data");
      return;
    }
    
    // Example: Send welcome message
    await sendWelcomeMessage("John", qaData, PHONE_NUMBER_ID, WHATSAPP_TOKEN, CUSTOMER_PHONE);
    
    // Wait a bit before sending next message
    setTimeout(async () => {
      // Example: Handle a specific inquiry
      await handleCustomerInquiry(
        "What are your current offers?",
        "John",
        qaData,
        PHONE_NUMBER_ID,
        WHATSAPP_TOKEN,
        CUSTOMER_PHONE
      );
    }, 3000);
    
    console.log("✅ Enhanced customer service messages sent successfully!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();

// Export functions for external use
export {
  loadQAData,
  generateIntelligentResponse,
  handleCustomerInquiry,
  handleServiceHoursQuery,
  handleOffersQuery,
  handlePricingQuery,
  handleBookingQuery,
  sendWelcomeMessage,
  sendWhatsAppTextMessage,
  sendWhatsAppButtonMessage,
  sendWhatsAppLinkMessage,
  sendQuickReplyMessage
}; 