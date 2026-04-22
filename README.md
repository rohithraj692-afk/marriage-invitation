# Wedding Invitation Website

Simple wedding invitation website for **Amrutha Ashok Weds Prabin Nandakumar** with:

- Click to open invitation screen
- Live countdown to **Dec 6, 2026**
- RSVP form with side selection, attendee count, and attendee names
- RSVP submission to Google Sheet via webhook
- Full-page background image support

## Run Locally

1. Open `index.html` in a browser.

## Customize Before Sharing

1. Add Google Sheets webhook URL in `script.js`:

   ```js
   const rsvpWebhookUrl = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE";
   ```

2. Add your background image at:

   `assets/HorizontalURL.jpg`

   (Create the `assets` folder if it does not exist.)

## Google Sheets Webhook Setup

1. Create a Google Sheet with headers in row 1:

   `Submitted At | Not Attending | Attending | Phone Number | Number Attending | Attendee Names | Side Tag`

2. In the sheet, open **Extensions → Apps Script** and paste this code:

   ```javascript
   function doPost(e) {
     const sheet =
       SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");

     const submittedAt = e.parameter.submittedAt || "";
     const responseType = (e.parameter.responseType || "").trim().toLowerCase();
     const contactName = e.parameter.contactName || "";
     const contactPhone = e.parameter.contactPhone || "";
     const peopleCount = e.parameter.peopleCount || "";
     const attendeeNames = e.parameter.attendeeNames || "";

     const guestSide = (e.parameter.guestSide || "").trim();
     const incomingGuestSideTag = (e.parameter.guestSideTag || "")
       .trim()
       .toUpperCase();
     const sideTag =
       incomingGuestSideTag === "G" || incomingGuestSideTag === "M"
         ? incomingGuestSideTag
         : guestSide === "പെണ്ണ് വീട്ടുകാർ"
           ? "G"
           : guestSide === "ചെക്കൻ വീട്ടുകാർ"
             ? "M"
             : "";

     const notAttendingName =
       responseType === "not attending" ? contactName : "";
     const attendingName = responseType === "attending" ? contactName : "";

     sheet.appendRow([
       submittedAt,
       notAttendingName,
       attendingName,
       contactPhone,
       peopleCount,
       attendeeNames,
       sideTag,
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
