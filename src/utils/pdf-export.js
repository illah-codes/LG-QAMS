/**
 * PDF Export Utility
 * Handles generating PDF reports using jsPDF
 */

/**
 * Download PDF report for staff
 * @param {Object} reportData - Report summary data
 * @param {Array} attendanceRecords - Detailed attendance records
 * @param {string} month - Month in YYYY-MM format
 * @param {Object} user - User/staff object
 */
export async function downloadPDFReport(reportData, attendanceRecords, month, user) {
  // Dynamically import jsPDF
  const { jsPDF } = await import('jspdf');

  // Format month for display
  const monthDate = new Date(`${month}-01`);
  const monthName = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  // Create new PDF document
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Monthly Attendance Report', 14, yPosition);
  yPosition += 10;

  // Staff Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  yPosition += 5;
  doc.text(`Staff: ${user.name || 'N/A'}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Staff ID: ${user.staff_id || 'N/A'}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Department: ${user.department || 'N/A'}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Month: ${monthName}`, 14, yPosition);
  yPosition += 10;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 14, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Working Days: ${reportData.totalWorkingDays || 0}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Present Days: ${reportData.presentDays || 0}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Absent Days: ${reportData.absences || 0}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Lateness Count: ${reportData.lateness || 0}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Average Check-In: ${reportData.averageCheckIn || 'N/A'}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Average Check-Out: ${reportData.averageCheckOut || 'N/A'}`, 14, yPosition);
  yPosition += 10;

  // Attendance Details Section
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Attendance Details', 14, yPosition);
  yPosition += 8;

  // Table headers
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  const tableStartX = 14;
  const colWidths = [40, 35, 35, 30, 25];
  const headers = ['Date', 'Check In', 'Check Out', 'Status', 'Late'];

  headers.forEach((header, index) => {
    doc.text(header, tableStartX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
  });
  yPosition += 6;

  // Draw line under headers
  doc.setLineWidth(0.5);
  doc.line(
    tableStartX,
    yPosition - 2,
    tableStartX + colWidths.reduce((a, b) => a + b, 0),
    yPosition - 2
  );
  yPosition += 2;

  // Table rows
  doc.setFont(undefined, 'normal');
  const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedRecords.forEach((record) => {
    checkPageBreak(10);

    const date = record.date ? new Date(record.date).toLocaleDateString('en-US') : 'N/A';
    const checkIn = record.check_in_time
      ? new Date(record.check_in_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
    const checkOut = record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
    const status = record.status || 'N/A';
    const isLate = record.is_late ? 'Yes' : 'No';

    const rowData = [date, checkIn, checkOut, status, isLate];
    rowData.forEach((cell, index) => {
      doc.text(cell, tableStartX + colWidths.slice(0, index).reduce((a, b) => a + b, 0), yPosition);
    });
    yPosition += 6;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US')}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  // Save PDF
  const filename = `attendance-report-${month}-${user.staff_id || 'staff'}.pdf`;
  doc.save(filename);
}
