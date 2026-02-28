// Create a new file: src/utils/exportTimetable.js

import jsPDF from 'jspdf';

const ExportTimetableToPDF = (planning, groupsData, filiere) => {
    // Create new PDF in landscape A4
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Page dimensions
    const pageWidth = 297;
    const pageHeight = 210;
    const margins = {
        left: 10,
        right: 10,
        top: 20,
        bottom: 15
    };

    // Column configuration
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const sessions = ['S1', 'S2', 'S3', 'S4'];
    const rowTypes = ['FORMATEUR', 'MODULE', 'SALLE'];

    // Calculate column widths
    const firstColumnWidth = 25; // Group name column
    const secondColumnWidth = 25; // Type column
    const dayColumnWidth = (pageWidth - margins.left - margins.right - firstColumnWidth - secondColumnWidth) / days.length;
    const sessionWidth = dayColumnWidth / sessions.length;

    // Row height
    const rowHeight = 12;

    // Colors
    const colors = {
        headerBlue: [41, 128, 185],
        headerText: [255, 255, 255],
        border: [0, 0, 0],
        emptyCell: [240, 240, 240],
        teamsGreen: [144, 238, 144],
        text: [0, 0, 0],
        alternateGroup: [245, 245, 245]
    };

    let currentPage = 1;
    let yOffset = margins.top;

    // Helper function to get group name by ID
    const getGroupName = (groupId) => {
        if (!groupsData || !groupsData.groupes) return `Groupe ${groupId}`;
        const group = groupsData.groupes.find(g => g.id === parseInt(groupId));
        return group ? group.nom : `Groupe ${groupId}`;
    };

    const drawHeader = () => {
        // Add title with filiere
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.headerBlue);
        pdf.text(`Emploi du Temps - ${filiere || 'Toutes les filières'}`, pageWidth / 2, margins.top - 5, { align: 'center' });

        // Reset text color for headers
        pdf.setTextColor(...colors.headerText);
        pdf.setFontSize(10);

        // Draw main headers
        pdf.setFont('helvetica', 'bold');

        // First column header
        pdf.setFillColor(...colors.headerBlue);
        pdf.rect(margins.left, yOffset, firstColumnWidth, rowHeight, 'F');
        pdf.rect(margins.left, yOffset, firstColumnWidth, rowHeight, 'S');
        pdf.text('Groupe', margins.left + 2, yOffset + rowHeight - 3);

        // Second column header
        pdf.setFillColor(...colors.headerBlue);
        pdf.rect(margins.left + firstColumnWidth, yOffset, secondColumnWidth, rowHeight, 'F');
        pdf.rect(margins.left + firstColumnWidth, yOffset, secondColumnWidth, rowHeight, 'S');
        pdf.text('Type', margins.left + firstColumnWidth + 2, yOffset + rowHeight - 3);

        // Day headers
        days.forEach((day, dayIndex) => {
            const dayX = margins.left + firstColumnWidth + secondColumnWidth + (dayIndex * dayColumnWidth);

            // Main day header
            pdf.setFillColor(...colors.headerBlue);
            pdf.rect(dayX, yOffset, dayColumnWidth, rowHeight, 'F');
            pdf.rect(dayX, yOffset, dayColumnWidth, rowHeight, 'S');
            pdf.text(day, dayX + 2, yOffset + rowHeight - 3);

            // Draw session sub-headers
            sessions.forEach((session, sessionIndex) => {
                const sessionX = dayX + (sessionIndex * sessionWidth);
                const sessionY = yOffset + rowHeight;

                pdf.setFillColor(...colors.headerBlue);
                pdf.rect(sessionX, sessionY, sessionWidth, rowHeight, 'F');
                pdf.rect(sessionX, sessionY, sessionWidth, rowHeight, 'S');

                // Format session name with time (matching your screenshot)
                const times = ['08:30', '11:00', '13:30', '16:00'];
                pdf.setFontSize(7);
                pdf.text(`S${sessionIndex + 1}`, sessionX + 2, sessionY + 4);
                pdf.text(times[sessionIndex], sessionX + 2, sessionY + rowHeight - 3);
            });
        });

        yOffset += rowHeight * 2;
    };

    const drawGroup = (groupId, groupIndex) => {
        const group = planning[groupId];
        if (!group) return;

        // Check if we need a new page
        if (yOffset + (rowHeight * 3) > pageHeight - margins.bottom) {
            pdf.addPage();
            currentPage++;
            yOffset = margins.top;
            drawHeader();
        }

        const groupName = getGroupName(groupId);

        // Draw group rows
        rowTypes.forEach((rowType, rowIndex) => {
            const currentY = yOffset + (rowIndex * rowHeight);

            // Draw first column (Group name - only for first row of the group)
            if (rowIndex === 0) {
                pdf.setFillColor(...colors.alternateGroup);
                pdf.rect(margins.left, currentY, firstColumnWidth, rowHeight, 'F');
                pdf.rect(margins.left, currentY, firstColumnWidth, rowHeight, 'S');
                pdf.setTextColor(...colors.text);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');

                // Handle long group names with wrapping
                const maxWidth = firstColumnWidth - 4;
                const lines = pdf.splitTextToSize(groupName, maxWidth);
                lines.forEach((line, lineIndex) => {
                    if (lineIndex < 2) {
                        pdf.text(line, margins.left + 2, currentY + 5 + (lineIndex * 4));
                    }
                });
            } else {
                // Empty cell for group name in subsequent rows
                pdf.setFillColor(255, 255, 255);
                pdf.rect(margins.left, currentY, firstColumnWidth, rowHeight, 'F');
                pdf.rect(margins.left, currentY, firstColumnWidth, rowHeight, 'S');
            }

            // Draw second column (Type)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margins.left + firstColumnWidth, currentY, secondColumnWidth, rowHeight, 'F');
            pdf.rect(margins.left + firstColumnWidth, currentY, secondColumnWidth, rowHeight, 'S');
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text(rowType, margins.left + firstColumnWidth + 2, currentY + rowHeight - 3);

            // Draw day cells
            days.forEach((day, dayIndex) => {
                const dayX = margins.left + firstColumnWidth + secondColumnWidth + (dayIndex * dayColumnWidth);

                sessions.forEach((session, sessionIndex) => {
                    const cellX = dayX + (sessionIndex * sessionWidth);
                    const cellData = group[day]?.[session];

                    // Determine cell background
                    if (cellData && cellData[rowType.toLowerCase()]) {
                        if (rowType === 'SALLE' && cellData.salle === 'Teams') {
                            pdf.setFillColor(...colors.teamsGreen);
                        } else {
                            pdf.setFillColor(255, 255, 255);
                        }
                    } else {
                        pdf.setFillColor(...colors.emptyCell);
                    }

                    // Draw cell background and border
                    pdf.rect(cellX, currentY, sessionWidth, rowHeight, 'F');
                    pdf.rect(cellX, currentY, sessionWidth, rowHeight, 'S');

                    // Draw cell text if exists
                    if (cellData && cellData[rowType.toLowerCase()]) {
                        pdf.setTextColor(...colors.text);
                        pdf.setFontSize(7);
                        pdf.setFont('helvetica', 'normal');

                        const text = cellData[rowType.toLowerCase()];

                        // Handle text wrapping
                        const maxWidth = sessionWidth - 4;
                        const lines = pdf.splitTextToSize(text, maxWidth);

                        // Draw text (centered vertically)
                        lines.forEach((line, lineIndex) => {
                            if (lineIndex < 2) {
                                pdf.text(line, cellX + 2, currentY + 5 + (lineIndex * 4));
                            }
                        });
                    }
                });
            });
        });

        yOffset += rowHeight * 3;

        // Add separator between groups
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(margins.left, yOffset - 1, pageWidth - margins.right, yOffset - 1);
        pdf.setLineWidth(0.1);
        pdf.setDrawColor(...colors.border);
    };

    const drawFooter = () => {
        for (let i = 1; i <= currentPage; i++) {
            pdf.setPage(i);
            pdf.setFontSize(7);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Page ${i} / ${currentPage}`, pageWidth - 25, pageHeight - 5);
            pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, margins.left, pageHeight - 5);
        }
    };

    // Start drawing
    drawHeader();

    // Draw each group
    const groupIds = Object.keys(planning);
    if (groupIds.length === 0) {
        // Handle empty planning
        pdf.setFontSize(12);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Aucune donnée disponible', pageWidth / 2, pageHeight / 2, { align: 'center' });
    } else {
        groupIds.sort((a, b) => parseInt(a) - parseInt(b));
        groupIds.forEach((groupId, index) => {
            drawGroup(groupId, index);
        });
    }

    drawFooter();

    // Save the PDF
    const filename = `emploi_du_temps_${filiere ? filiere.replace(/\s+/g, '_') : 'general'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
};

export default ExportTimetableToPDF;