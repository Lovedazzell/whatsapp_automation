# WhatsApp Customer Service Bot

An AI-powered WhatsApp customer service bot that integrates with OpenAI's GPT models to provide intelligent, automated customer support. The bot can handle inquiries about service availability, offers, pricing, and more, while sending interactive messages with clickable buttons and links.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI GPT models for intelligent, contextual customer service responses
- 📱 **WhatsApp Integration**: Sends messages via WhatsApp Cloud API
- 🔗 **Interactive Elements**: Supports clickable buttons, quick replies, and clickable links
- 📚 **Q&A Database**: Configurable question-answer database for common inquiries
- 🕒 **Service Hours Management**: Handles queries about business availability
- 💰 **Offers & Promotions**: Manages and communicates current deals and discounts
- 📋 **Appointment Booking**: Provides booking options and contact information
- 🎯 **Smart Routing**: Automatically categorizes and routes customer inquiries

## Files Structure

```
├── customer_service_bot.js          # Basic customer service bot
├── enhanced_customer_service_bot.js # Advanced bot with Q&A integration
├── customer_service_qa.json         # Q&A database and business information
├── package.json                     # Project dependencies
└── README.md                       # This file
```

## Prerequisites

- Node.js 18.0.0 or higher
- OpenAI API key
- WhatsApp Business API access (Meta Developer Console)
- WhatsApp Cloud API token
- Phone Number ID from Meta Developer Console

## Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API keys and tokens**
   
   Edit the configuration section in your chosen bot file:
   ```javascript
   const OPENAI_API_KEY = "your_openai_api_key_here";
   const WHATSAPP_TOKEN = "your_whatsapp_cloud_api_token_here";
   const PHONE_NUMBER_ID = "your_whatsapp_phone_number_id_here";
   const CUSTOMER_PHONE = "customer_phone_number_here";
   ```

4. **Customize the Q&A database**
   
   Edit `customer_service_qa.json` with your business information:
   - Business name and description
   - Service hours
   - Contact information
   - Current offers
   - FAQ entries
   - Response templates

## Usage

### Basic Bot
```bash
npm run start:basic
```

### Enhanced Bot (Recommended)
```bash
npm run start
```

### Development Mode (Auto-restart on changes)
```bash
npm run dev
```

## Configuration

### 1. Business Information (`customer_service_qa.json`)

Update the following sections with your business details:

```json
{
  "business_info": {
    "name": "Your Business Name",
    "description": "Your business description"
  },
  "service_hours": {
    "weekdays": "9:00 AM - 6:00 PM (Monday to Friday)",
    "weekends": "10:00 AM - 4:00 PM (Saturday)"
  },
  "contact_info": {
    "phone": "+1-800-YOUR-PHONE",
    "email": "support@yourbusiness.com",
    "website": "https://yourbusiness.com"
  }
}
```

### 2. Current Offers

Add your current promotions and discounts:

```json
{
  "current_offers": [
    {
      "title": "New Customer Discount",
      "description": "20% off on first service",
      "valid_until": "December 31, 2024",
      "code": "NEW20"
    }
  ]
}
```

### 3. FAQ Entries

Add common customer questions and answers:

```json
{
  "faq": [
    {
      "question": "What are your business hours?",
      "answer": "We're open Monday to Friday from 9:00 AM to 6:00 PM...",
      "category": "hours"
    }
  ]
}
```

## WhatsApp Message Types

### 1. Text Messages
Basic text responses with automatic link detection.

### 2. Interactive Buttons
```javascript
const buttons = [
  {
    type: "url",
    url: "https://yourwebsite.com",
    title: "Visit Website"
  },
  {
    type: "phone_number",
    phone_number: "+1234567890",
    title: "Call Us"
  }
];

await sendWhatsAppButtonMessage("Choose an option:", buttons);
```

### 3. Quick Reply Options
```javascript
const quickReplies = ["Service Hours", "Current Offers", "Book Appointment"];
await sendQuickReplyMessage("How can I help you?", quickReplies);
```

### 4. Clickable Links
```javascript
await sendWhatsAppLinkMessage(
  "Visit our website for more information:",
  "Click Here",
  "https://yourwebsite.com"
);
```

## API Endpoints

The bot integrates with these APIs:

- **OpenAI API**: For generating intelligent responses
- **WhatsApp Cloud API**: For sending messages
- **Meta Graph API**: For WhatsApp Business features

## Customization Examples

### Adding New Response Types

```javascript
async function handleCustomQuery(customerName, qaData, phoneNumberId, whatsappToken, customerPhone) {
  const response = await generateIntelligentResponse("Your custom query", customerName, qaData);
  await sendWhatsAppTextMessage(response, phoneNumberId, whatsappToken, customerPhone);
}
```

### Modifying Response Templates

Edit the `response_templates` section in `customer_service_qa.json`:

```json
{
  "response_templates": {
    "custom_greeting": "Hello {customer_name}! Welcome to {business_name}..."
  }
}
```

## Error Handling

The bot includes comprehensive error handling:

- API failures fall back to direct contact information
- Invalid responses trigger fallback messages
- Network issues are logged and handled gracefully

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting for API calls
- Validate customer phone numbers
- Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **WhatsApp API Errors**
   - Verify your token and phone number ID
   - Check API permissions in Meta Developer Console
   - Ensure your WhatsApp Business account is active

2. **OpenAI API Errors**
   - Verify your API key
   - Check your OpenAI account balance
   - Monitor rate limits

3. **Message Not Sending**
   - Verify customer phone number format (international format)
   - Check WhatsApp Business API status
   - Review API response logs

### Debug Mode

Enable detailed logging by modifying the console.log statements in the code.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review WhatsApp Business API documentation
3. Check OpenAI API documentation
4. Review the code comments for implementation details

## License

MIT License - feel free to modify and use for your business needs.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for improvements.

---

**Note**: This bot is designed for customer service inquiries and should not be used for spam or unsolicited messages. Always comply with WhatsApp's terms of service and local regulations. 