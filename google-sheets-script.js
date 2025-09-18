// Google Apps Script code for Google Sheets integration
// This code should be added to a Google Apps Script project connected to your Google Sheet

function doPost(e) {
  try {
    // Parse the incoming data
    const requestData = JSON.parse(e.postData.contents);
    
    if (requestData.type === 'classAssignment') {
      // Handle class assignment submission
      return handleClassAssignment(requestData.data);
    } else {
      // Handle regular student registration
      return handleStudentRegistration(requestData);
    }
      
  } catch (error) {
    console.error('Error processing form submission:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleStudentRegistration(data) {
  // Get the registration sheet (first sheet)
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheets()[0]; // First sheet for registrations
  
  // Check if this is the first submission (setup headers)
  if (sheet.getLastRow() === 0) {
    setupRegistrationHeaders(sheet);
  }
  
  // Add the form data to the sheet
  addRegistrationDataToSheet(sheet, data);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true, message: 'Registration submitted successfully'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleClassAssignment(data) {
  // Get or create class assignments sheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let assignmentSheet = spreadsheet.getSheetByName('Class Assignments');
  
  if (!assignmentSheet) {
    assignmentSheet = spreadsheet.insertSheet('Class Assignments');
    setupClassAssignmentHeaders(assignmentSheet);
  }
  
  // Add the assignment data to the sheet
  addClassAssignmentToSheet(assignmentSheet, data);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true, message: 'Class assignment completed successfully'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupRegistrationHeaders(sheet) {
  const headers = [
    'Submission Date',
    'Today Date',
    'First Name',
    'Last Name',
    'Gender',
    'Native Language',
    'Country of Origin',
    'Address',
    'City',
    'Zip Code',
    'County',
    'Telephone',
    'Email',
    'Birthday',
    'Emergency Contact Name',
    'Emergency Contact Phone',
    'Attends Church',
    'Church Name'
  ];
  
  // Add headers to the first row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

function setupClassAssignmentHeaders(sheet) {
  const headers = [
    'Assignment Date',
    'Student First Name',
    'Student Last Name',
    'Student Email',
    'Interview Score',
    'Alphabet Reading',
    'Paragraph Reading',
    'Class Level',
    'Notes'
  ];
  
  // Add headers to the first row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#dc3545');
  headerRange.setFontColor('white');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

function addRegistrationDataToSheet(sheet, data) {
  // Get current date for both submission timestamp and today's date
  const currentDate = new Date();
  const submissionTimestamp = currentDate.toLocaleString();
  const todaysDate = currentDate.toLocaleDateString();
  
  // Prepare the row data in the same order as headers
  const rowData = [
    submissionTimestamp, // Submission timestamp (Column A)
    todaysDate,          // Today's date (Column B) - automatically filled
    data.firstName || '',
    data.lastName || '',
    data.gender || '',
    data.nativeLanguage || '',
    data.countryOfOrigin || '',
    data.address || '',
    data.city || '',
    data.zipCode || '',
    data.county || '',
    data.telephone || '',
    data.email || '',
    data.birthday || '',
    data.emergencyContactName || '',
    data.emergencyContactPhone || '',
    data.attendsChurch || '',
    data.churchName || ''
  ];
  
  // Add the data to the next available row
  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the new row
  const newRowRange = sheet.getRange(nextRow, 1, 1, rowData.length);
  newRowRange.setBorder(true, true, true, true, true, true);
  
  // Alternate row colors for better readability
  if (nextRow % 2 === 0) {
    newRowRange.setBackground('#f8f9fa');
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const callback = e.parameter.callback;
    
    if (action === 'getStudents') {
      const result = getRegisteredStudents();
      
      // If JSONP callback is provided, wrap the response
      if (callback) {
        const jsonData = result.getContent();
        return ContentService
          .createTextOutput(callback + '(' + jsonData + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return result;
      }
    } else {
      // Handle default GET requests (for testing)
      return ContentService
        .createTextOutput('ESOL Registration Form Google Sheets API is working!')
        .setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    
    const errorResponse = JSON.stringify({success: false, error: error.toString()});
    const callback = e.parameter.callback;
    
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + errorResponse + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(errorResponse)
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function getRegisteredStudents() {
  try {
    // Get the registration sheet (first sheet)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheets()[0]; // First sheet for registrations
    
    // Get all data from the sheet
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      // No data (only headers or empty sheet)
      return ContentService
        .createTextOutput(JSON.stringify({success: true, students: []}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get data starting from row 2 (skip headers)
    const data = sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
    
    // Convert data to student objects
    const students = data.map(row => {
      return {
        submissionDate: row[0] || '',
        todayDate: row[1] || '',
        firstName: row[2] || '',
        lastName: row[3] || '',
        gender: row[4] || '',
        nativeLanguage: row[5] || '',
        countryOfOrigin: row[6] || '',
        address: row[7] || '',
        city: row[8] || '',
        zipCode: row[9] || '',
        county: row[10] || '',
        telephone: row[11] || '',
        email: row[12] || '',
        birthday: row[13] || '',
        emergencyContactName: row[14] || '',
        emergencyContactPhone: row[15] || '',
        attendsChurch: row[16] || '',
        churchName: row[17] || ''
      };
    }).filter(student => student.firstName && student.lastName); // Only include students with names
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, students: students}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error getting registered students:', error);
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testFunction() {
  const testData = {
    todaysDate: '2023-05-04',
    firstName: 'Test',
    lastName: 'User',
    gender: 'Male',
    nativeLanguage: 'Spanish',
    countryOfOrigin: 'Mexico',
    address: '123 Test Street',
    city: 'Test City',
    zipCode: '12345',
    county: 'Test County',
    telephone: '123-456-7890',
    email: 'test@example.com',
    birthday: '1990-01-01',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '098-765-4321',
    attendsChurch: 'Yes',
    churchName: 'Test Church'
  };
  
  const sheet = SpreadsheetApp.getActiveSheet();
  
  if (sheet.getLastRow() === 0) {
    setupRegistrationHeaders(sheet);
  }
  
  addRegistrationDataToSheet(sheet, testData);
  
  console.log('Test data added successfully');
}

function addClassAssignmentToSheet(sheet, data) {
  const rowData = [
    new Date().toLocaleString(), // Assignment timestamp
    data.studentFirstName || '',
    data.studentLastName || '',
    data.studentEmail || '',
    data.interviewScore || '',
    data.alphabetReading || '',
    data.paragraphReading || '',
    data.classLevel || '',
    data.notes || ''
  ];
  
  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
  
  // Format the new row
  const newRowRange = sheet.getRange(nextRow, 1, 1, rowData.length);
  newRowRange.setBorder(true, true, true, true, true, true);
  
  // Alternate row colors for better readability
  if (nextRow % 2 === 0) {
    newRowRange.setBackground('#f8f9fa');
  }
}