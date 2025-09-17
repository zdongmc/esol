# ESOL Registration Form Setup Instructions

## Overview
This online ESOL registration form includes Google Translate integration for multi-language support and Google Sheets integration for data storage.

## Files Included
- `index.html` - Main registration form
- `styles.css` - Styling and responsive design
- `script.js` - Form validation and submission logic
- `google-sheets-script.js` - Google Apps Script code for Sheets integration
- `SETUP_INSTRUCTIONS.md` - This file

## Google Sheets Setup

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "ESOL Registration Submissions" (or your preferred name)
4. Note the Sheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 2: Set up Google Apps Script
1. In your Google Sheet, go to `Extensions` > `Apps Script`
2. Delete any existing code in the editor
3. Copy and paste the contents of `google-sheets-script.js` into the editor
4. Save the project (Ctrl+S or Cmd+S)
5. Name the project "ESOL Registration Handler"

### Step 3: Deploy the Web App
1. In the Apps Script editor, click `Deploy` > `New deployment`
2. Click the gear icon next to "Type" and select "Web app"
3. Set the following options:
   - Description: "ESOL Registration Form Handler"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click `Deploy`
5. Review and authorize permissions when prompted
6. Copy the Web App URL that appears after deployment

### Step 4: Update the Form
1. Open `script.js` in a text editor
2. Find the line: `const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE';`
3. Replace `YOUR_GOOGLE_SHEETS_WEB_APP_URL_HERE` with the Web App URL from Step 3
4. Save the file

## Testing the Setup

### Test Google Sheets Integration
1. In the Apps Script editor, run the `testFunction()` to verify it works
2. Check your Google Sheet - you should see headers and a test row of data

### Test the Form
1. Open `index.html` in a web browser
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet for the new submission

## Features

### Multi-language Support
- Google Translate widget in the top-right corner
- Supports 14 languages: English, Spanish, French, Portuguese, Arabic, Chinese, Korean, Vietnamese, Russian, German, Italian, Japanese, Hindi, and Filipino
- All form labels are bilingual (English/Spanish)

### Form Validation
- Required field validation
- Email format validation
- Phone number formatting (automatically adds hyphens)
- Date field validation

### Responsive Design
- Mobile-friendly layout
- Adaptive form layout for different screen sizes
- Touch-friendly interface

### Data Security
- Client-side validation
- Secure HTTPS transmission to Google Sheets
- No sensitive data stored locally

## Customization Options

### Adding More Languages
To add more languages to Google Translate:
1. Edit `script.js`
2. Find the `includedLanguages` parameter in `googleTranslateElementInit()`
3. Add language codes separated by commas (e.g., 'en,es,fr,pt,ar,zh,ko,vi,ru,de,it,ja,hi,tl,sw')

### Modifying Form Fields
1. Edit `index.html` to add/remove fields
2. Update `styles.css` for styling
3. Modify `script.js` validation logic
4. Update `google-sheets-script.js` headers and data mapping

### Styling Customization
- Edit `styles.css` to change colors, fonts, layout
- The form uses CSS Grid for responsive layout
- Color scheme can be changed by updating the CSS variables

## Troubleshooting

### Form Submissions Not Appearing in Google Sheets
1. Check the Web App URL in `script.js`
2. Verify the Google Apps Script deployment is active
3. Check browser console for error messages
4. Ensure the Google Sheet has proper permissions

### Google Translate Not Working
1. Verify internet connection
2. Check browser console for JavaScript errors
3. Ensure the Google Translate script is loading properly

### Mobile Display Issues
1. Check viewport meta tag in HTML
2. Test responsive CSS breakpoints
3. Verify touch interactions work properly

## Support
For technical support or issues:
1. Check browser console for error messages
2. Verify all setup steps were completed correctly
3. Test with different browsers
4. Check Google Apps Script execution transcript for errors

## Security Notes
- The form uses HTTPS for secure data transmission
- No sensitive data is stored in localStorage
- Google Sheets provides built-in access controls
- Consider implementing additional validation server-side for production use