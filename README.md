# Wedding Invitation Website

Simple wedding invitation website for **Amrutha Ashok Weds Prabin Nandakumar** with:

- Click to open invitation screen
- Live countdown to **Dec 6, 2026**
- RSVP form with attendee count and attendee names
- RSVP submission to Google Sheet via webhook
- Optional RSVP email draft via `mailto`
- Full-page background image support

## Run Locally

1. Open `index.html` in a browser.

## Customize Before Sharing

1. Add Google Sheets webhook URL in `script.js`:

   ```js
   const rsvpWebhookUrl = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE";
   ```

2. (Optional) Replace RSVP email address in `script.js`:

   ```js
   const rsvpEmail = "your-email@example.com";
   ```

3. Add your background image at:

   `assets/wedding-background.jpg`

   (Create the `assets` folder if it does not exist.)

## Google Sheets Webhook Setup

1. Create a Google Sheet with headers in row 1:

   `Submitted At | Contact Name | Phone Number | Number Attending | Attendee Names`

2. In the sheet, open **Extensions → Apps Script** and paste this code:

   ```javascript
   function doPost(e) {
     const sheet =
       SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
     sheet.appendRow([
       e.parameter.submittedAt || "",
       e.parameter.contactName || "",
       e.parameter.contactPhone || "",
       e.parameter.peopleCount || "",
       e.parameter.attendeeNames || "",
     ]);

     return ContentService.createTextOutput(
       JSON.stringify({ success: true }),
     ).setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

4. Copy the **Web app URL** and paste it into `rsvpWebhookUrl` in `script.js`.

5. Submit one RSVP from your page and verify the new row appears in the sheet.

## Wedding Details

- Date: Dec 6th, 2026
- Location: Silvercloud Private Resort | Wedding Banquet Hall, Chalakkal, Parappur, Kerala 680552
