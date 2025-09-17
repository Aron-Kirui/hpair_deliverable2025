import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { getLanguageByCode } from '../data/languages';


const formatPreferredLanguage = (submission = {}) => {
  const pref = submission.languagePreference;
  if (!pref) return '—';
  if (pref === 'other') return submission.otherLanguage || '—';

  // If we stored a code like "en", map to full name; otherwise show as-is
  const mapped = getLanguageByCode(pref);
  return mapped?.name || pref;
};

/** Builds a plain-text summary (kept for compatibility / debugging) */
export const buildSummaryText = (submission = {}) => {
  const addr = submission.address || {};
  const phone = submission.phone || {};
  const country = submission.country || {};
  const sm = submission.socialMedia || {};
  const cv = submission.documents?.cv;

  const lines = [
    'HPAIR Application Summary',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    '--- Personal ---',
    `First Name: ${submission.firstName || '—'}`,
    `Last Name: ${submission.lastName || '—'}`,
    `Date of Birth: ${submission.dateOfBirth || '—'}`,
    `Gender: ${submission.gender || '—'}`,
    `Email: ${submission.email || '—'}`,
    '',
    '--- Contact ---',
    `Address 1: ${addr.address1 || '—'}`,
    `Address 2: ${addr.address2 || '—'}`,
    `City: ${addr.city || '—'}`,
    `State/Province: ${addr.state || '—'}`,
    `Postal Code: ${addr.postalCode || '—'}`,
    `Country: ${addr.country || '—'}`,
    `Phone: ${(phone.countryCode || '') + ' ' + (phone.number || '')}`.trim(),
    `Citizenship Country: ${country.name || '—'}`,
    `Nationality: ${country.nationality || '—'}`,
    '',
    '--- Professional ---',
    `LinkedIn: ${submission.linkedin || '—'}`,
    `Preferred Language: ${formatPreferredLanguage(submission)}`,
    ...(sm.platforms?.length
      ? [
          '',
          'Social Profiles:',
          sm.platforms.includes('twitter') ? `  - Twitter/X: ${sm.twitter || '—'}` : null,
          sm.platforms.includes('instagram') ? `  - Instagram: ${sm.instagram || '—'}` : null,
          sm.platforms.includes('facebook') ? `  - Facebook: ${sm.facebook || '—'}` : null,
          sm.platforms.includes('github') ? `  - GitHub: ${sm.github || '—'}` : null
        ].filter(Boolean)
      : ['Social Profiles: (none)']),
    '',
    '--- Documents ---',
    `CV: ${
      cv ? `${cv.name} (${cv.size ? (cv.size / 1024 / 1024).toFixed(2) + ' MB' : ''})` : '(not uploaded)'
    }`
  ];

  return lines.join('\n');
};

export const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const openPrintWindow = (submission) => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(
    `<pre style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;white-space:pre-wrap;">${buildSummaryText(
      submission
    )}</pre>`
  );
  win.document.close();
  win.focus();
  win.print();
};

/*  jsPDF summary page(s) generator */
/** Build the summary as a jsPDF instance; caller decides how to save/merge. */
const buildSummaryPdf = (submission) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const page = { w: doc.internal.pageSize.getWidth(), h: doc.internal.pageSize.getHeight() };
  const margin = 48;
  let y = margin;

  const text = (t, x = margin) => doc.text(String(t), x, y);
  const line = () => {
    doc.setDrawColor(224);
    doc.setLineWidth(1);
    doc.line(margin, y, page.w - margin, y);
  };
  const move = (dy) => {
    y += dy;
    if (y > page.h - margin) {
      doc.addPage();
      y = margin;
    }
  };
  const section = (title) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    text(title); move(8); line(); move(12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  };
  const row = (label, value) => {
    const v = value === undefined || value === null || value === '' ? '—' : String(value);
    const labelW = 140;
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    const maxW = page.w - margin - (margin + labelW);
    const wrapped = doc.splitTextToSize(v, maxW);
    doc.text(wrapped, margin + labelW, y);
    const lines = Array.isArray(wrapped) ? wrapped.length : 1;
    move(16 * Math.max(1, lines));
  };

  const addr = submission?.address || {};
  const phone = submission?.phone || {};
  const citizen = submission?.country || {};
  const sm = submission?.socialMedia || {};

  // Header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  text('HPAIR Application Summary');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  move(14); doc.setTextColor(102);
  text(`Generated: ${new Date().toLocaleString()}`);
  doc.setTextColor(0); move(18);

  // Sections
  section('Personal');
  row('First Name', submission?.firstName);
  row('Last Name', submission?.lastName);
  row('Date of Birth', submission?.dateOfBirth);
  row('Gender', submission?.gender);
  row('Email', submission?.email);

  section('Contact');
  row('Address Line 1', addr.address1);
  row('Address Line 2', addr.address2);
  row('City', addr.city);
  row('State/Province', addr.state);
  row('Postal Code', addr.postalCode);
  row('Country', addr.country);
  row('Phone', `${phone.countryCode || ''} ${phone.number || ''}`.trim());
  row('Citizenship Country', citizen.name);
  row('Nationality', citizen.nationality);

  section('Professional');
  row('LinkedIn', submission?.linkedin);
  row('Preferred Language', formatPreferredLanguage(submission));
  if (sm?.platforms?.length) {
    if (sm.platforms.includes('twitter')) row('Twitter/X', sm.twitter);
    if (sm.platforms.includes('instagram')) row('Instagram', sm.instagram);
    if (sm.platforms.includes('facebook')) row('Facebook', sm.facebook);
    if (sm.platforms.includes('github')) row('GitHub', sm.github);
  } else {
    row('Social Profiles', '(none)');
  }

  section('Documents');
  const cv = submission?.documents?.cv;
  row('CV', cv ? `${cv.name} • ${cv.size ? (cv.size / 1024 / 1024).toFixed(2) + ' MB' : ''}` : '(not uploaded)');

  return doc;
};

/*  public API: download a proper PDF */
/**
 * Generate and download a PDF summary. If a CV File is present in
 * submission.documents.cv, append its pages after the summary.
 */
export const downloadSubmissionPdf = async (submission, filename = 'application-summary.pdf') => {
  // 1) Build summary pages with jsPDF
  const summaryDoc = buildSummaryPdf(submission);
  const summaryBytes = summaryDoc.output('arraybuffer');

  // 2) If we have a real File for the CV, merge it using pdf-lib
  const cvFile = submission?.documents?.cv instanceof File ? submission.documents.cv : null;

  try {
    if (cvFile) {
      const [summaryPdf, cvPdf] = await Promise.all([
        PDFDocument.load(summaryBytes),
        PDFDocument.load(await cvFile.arrayBuffer()),
      ]);

      const out = await PDFDocument.create();
      const sPages = await out.copyPages(summaryPdf, summaryPdf.getPageIndices());
      sPages.forEach(p => out.addPage(p));
      const cPages = await out.copyPages(cvPdf, cvPdf.getPageIndices());
      cPages.forEach(p => out.addPage(p));

      const finalBytes = await out.save();
      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    // If merge fails, fall back to just the summary
    console.error('PDF merge failed, falling back to summary only:', err);
  }

  // 3) Fallback: just download the summary
  summaryDoc.save(filename);
};
