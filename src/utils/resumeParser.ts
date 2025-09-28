import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface ParsedResume {
  text: string;
  name?: string;
  email?: string;
  phone?: string;
}

export async function parseResume(file: File): Promise<ParsedResume> {
  let text = '';
  
  if (file.type === 'application/pdf') {
    text = await parsePDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await parseDOCX(file);
  } else {
    throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
  }

  return {
    text,
    ...extractFields(text),
  };
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return text;
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function extractFields(text: string): Partial<ParsedResume> {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  
  // Simple name extraction - look for patterns at the beginning of the resume
  const lines = text.split('\n').filter(line => line.trim());
  let name = '';
  
  // Look for name in first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    // Skip lines that look like headers or contact info
    if (line.length > 3 && line.length < 50 && 
        !line.includes('@') && 
        !phoneRegex.test(line) &&
        !/^\d/.test(line) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv')) {
      // Check if it looks like a name (2-4 words, each starting with capital)
      const words = line.split(' ').filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 4 && 
          words.every(w => /^[A-Z][a-z]/.test(w))) {
        name = line;
        break;
      }
    }
  }

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);

  return {
    name: name || undefined,
    email: emailMatch?.[0] || undefined,
    phone: phoneMatch?.[0] || undefined,
  };
}