import { jsPDF } from 'jspdf';
import { TriageAssessment, UserProfile } from '../types/medical';
import { COMMON_SYMPTOMS } from '../data/medicalKnowledge';

export function generateAndDownloadPdf(
  assessment: TriageAssessment,
  currentProfile: UserProfile,
  reportId: string,
  userEmail: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const symptomInfo = COMMON_SYMPTOMS.find(s => s.id === assessment.primarySymptom) || COMMON_SYMPTOMS[0];
  const isSevere = assessment.severity === 'emergency' || assessment.severity === 'severe';

  // Palette
  const primaryTeal = [13, 148, 136]; // #0d9488
  const darkSlate = [15, 23, 42]; // #0f172a
  const softGray = [100, 116, 139]; // #64748b
  const lightBg = [240, 253, 250]; // #f0fdfa

  let y = 14;

  // Header Banner
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(12, y, 186, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MediMitra - Digital Medical Report', 18, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('AI Medical Symptom Triage & Clinical Checkup', 18, y + 16);

  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId}`, 190, y + 9, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 190, y + 16, { align: 'right' });

  y += 28;

  // Patient Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, 186, 22, 2, 2, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PATIENT DEMOGRAPHICS', 16, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${currentProfile.name}`, 16, y + 12);
  doc.text(`Category: ${currentProfile.ageCategory.toUpperCase()} (${currentProfile.age} yrs)`, 70, y + 12);
  doc.text(`Gender: ${currentProfile.sex.toUpperCase()}`, 130, y + 12);
  doc.text(`Email: ${userEmail || currentProfile.email || 'N/A'}`, 16, y + 18);
  doc.text(`Chief Symptom: ${symptomInfo.name}`, 130, y + 18);

  y += 28;

  // Triage Status Box
  if (isSevere) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.setTextColor(153, 27, 27);
  } else {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.setTextColor(6, 95, 70);
  }

  doc.roundedRect(12, y, 186, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(
    isSevere
      ? 'TRIAGE RESULT: SEVERE - IN-PERSON MEDICAL EVALUATION REQUIRED'
      : 'TRIAGE RESULT: MILD / BASIC HEALTH PROBLEM - SAFE FOR HOME CARE',
    16,
    y + 7
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const summaryLines = doc.splitTextToSize(assessment.clinicalSummary, 178);
  doc.text(summaryLines, 16, y + 13);

  y += 26;

  // Recommended Medicines Section
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMMENDED BASIC OVER-THE-COUNTER MEDICINE', 12, y);
  y += 5;

  if (!isSevere && assessment.recommendedOtcs.length > 0) {
    assessment.recommendedOtcs.forEach((otc) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(204, 251, 241);
      doc.roundedRect(12, y, 186, 21, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${otc.name} (${otc.category})`, 16, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Dosage Guide: ${otc.dosageGuide}`, 16, y + 10);

      if (otc.childDosageNote) {
        doc.setTextColor(180, 83, 9);
        doc.text(`Pediatric Note: ${otc.childDosageNote}`, 16, y + 14);
      }

      doc.setTextColor(100, 116, 139);
      doc.text(`Safety Caution: ${otc.safetyCaution}`, 16, y + (otc.childDosageNote ? 18 : 15));

      y += 24;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No basic home medications recommended due to severity. Immediate doctor examination required.', 12, y + 2);
    y += 10;
  }

  // Home Care Comfort Tips
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SUPPORTIVE HOME CARE MEASURES', 12, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, y, 186, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('1. Maintain adequate hydration with warm fluids, water, and electrolyte broths.', 16, y + 6);
  doc.text('2. Prioritize rest and avoid strenuous physical exertion or excessive screen eye strain.', 16, y + 11);
  doc.text('3. Seek immediate emergency evaluation if breathing difficulty, stiff neck, or extreme lethargy develops.', 16, y + 16);

  y += 26;

  // Recommended Nearest Doctors & Google Maps Referral
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RECOMMENDED NEAREST DOCTORS & CLINICS', 12, y);
  y += 5;

  assessment.recommendedDoctors.slice(0, 2).forEach((docInfo) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(12, y, 186, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${docInfo.name} - ${docInfo.specialty}`, 16, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Hospital: ${docInfo.hospital} | Distance: ${docInfo.distanceKm} km | Phone: ${docInfo.phone}`, 16, y + 10);
    doc.text(`Address: ${docInfo.address}`, 16, y + 14);

    y += 19;
  });

  // Footer Disclaimer
  y = Math.min(y, 275);
  doc.setDrawColor(203, 213, 225);
  doc.line(12, y, 198, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Medical Disclaimer: This report was prepared by MediMitra for informational health triage. It does not constitute a formal prescription or surgical clearance. In case of life-threatening emergency, call 112 / 911 immediately.',
    12,
    y + 5,
    { maxWidth: 186 }
  );

  // Trigger real file download
  doc.save(`MediMitra_Report_${reportId}.pdf`);
}
