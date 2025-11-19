/**
 * Utility functions for exporting data in user-friendly formats
 */

export interface CSVSection {
    title: string;
    headers: string[];
    data: (string | number)[][];
}

export interface ExportOptions {
    filename: string;
    title?: string;
    includeTimestamp?: boolean;
}

/**
 * Converts data to CSV format with multiple sections
 */
export function createCSVContent(
    sections: CSVSection[],
    options: ExportOptions
): string {
    let csvContent = '';
    const timestamp = new Date().toLocaleString();

    // Add header if title provided
    if (options.title) {
        csvContent += `${options.title}\n`;
    }

    if (options.includeTimestamp !== false) {
        csvContent += `Generated on: ${timestamp}\n\n`;
    }

    // Add each section
    sections.forEach((section, index) => {
        // Section title
        csvContent += `${section.title.toUpperCase()}\n`;

        // Headers
        csvContent += section.headers.join(',') + '\n';

        // Data rows
        section.data.forEach((row) => {
            const escapedRow = row.map((cell) => {
                const stringCell = String(cell);
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (
                    stringCell.includes(',') ||
                    stringCell.includes('"') ||
                    stringCell.includes('\n')
                ) {
                    return `"${stringCell.replace(/"/g, '""')}"`;
                }
                return stringCell;
            });
            csvContent += escapedRow.join(',') + '\n';
        });

        // Add spacing between sections (except last one)
        if (index < sections.length - 1) {
            csvContent += '\n';
        }
    });

    return csvContent;
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

/**
 * Formats numbers for CSV export
 */
export function formatNumberForCSV(num: number): string {
    return num.toLocaleString();
}

/**
 * Formats dates for CSV export
 */
export function formatDateForCSV(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

/**
 * Formats percentage for CSV export
 */
export function formatPercentageForCSV(num: number): string {
    return `${Math.round(num)}%`;
}
