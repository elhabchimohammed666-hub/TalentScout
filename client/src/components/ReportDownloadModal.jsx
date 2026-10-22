import React, { useRef } from 'react';
import Modal from './Modal';
import { Download, Printer, Award, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportDownloadModal({ isOpen, onClose, player, latestEvaluation, aiAnalysis, attendanceStats }) {
  const printRef = useRef(null);

  if (!player) return null;

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TalentScout_${player.firstName}_${player.lastName}_Report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Player Development Report Preview"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex justify-end gap-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div
          ref={printRef}
          className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-800 space-y-6"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
                TS
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">TalentScout Academy</h2>
                <p className="text-xs text-slate-500 font-medium">Individual Player Development & AI Performance Dossier</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Generated Date</span>
              <span className="text-sm font-semibold text-slate-800">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Player Bio Summary Card */}
          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Player Name</span>
              <span className="text-sm font-bold text-slate-900">{player.firstName} {player.lastName}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Position & Category</span>
              <span className="font-semibold text-slate-800">{player.primaryPosition} ({player.ageCategory})</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Dominant Foot / Jersey</span>
              <span className="font-semibold text-slate-800">{player.dominantFoot} Foot / #{player.jerseyNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Attendance Rate</span>
              <span className="font-bold text-emerald-600">{attendanceStats ? attendanceStats.attendanceRate : 100}%</span>
            </div>
          </div>

          {/* Evaluation Scores Breakdown */}
          {latestEvaluation && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span>Latest Structured Evaluation ({new Date(latestEvaluation.date).toLocaleDateString()})</span>
                <span className="text-emerald-700 font-extrabold text-base">Overall: {latestEvaluation.overallScore}/10</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1">Physical</p>
                  <p className="flex justify-between">Speed: <span className="font-semibold">{latestEvaluation.physicalAbilities?.speed}</span></p>
                  <p className="flex justify-between">Endurance: <span className="font-semibold">{latestEvaluation.physicalAbilities?.endurance}</span></p>
                  <p className="flex justify-between">Agility: <span className="font-semibold">{latestEvaluation.physicalAbilities?.agility}</span></p>
                  <p className="flex justify-between">Strength: <span className="font-semibold">{latestEvaluation.physicalAbilities?.strength}</span></p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1">Technical</p>
                  <p className="flex justify-between">Passing: <span className="font-semibold">{latestEvaluation.technicalSkills?.passing}</span></p>
                  <p className="flex justify-between">Shooting: <span className="font-semibold">{latestEvaluation.technicalSkills?.shooting}</span></p>
                  <p className="flex justify-between">Dribbling: <span className="font-semibold">{latestEvaluation.technicalSkills?.dribbling}</span></p>
                  <p className="flex justify-between">Ball Control: <span className="font-semibold">{latestEvaluation.technicalSkills?.ballControl}</span></p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1">Tactical</p>
                  <p className="flex justify-between">Positioning: <span className="font-semibold">{latestEvaluation.tacticalAbilities?.positioning}</span></p>
                  <p className="flex justify-between">Decision: <span className="font-semibold">{latestEvaluation.tacticalAbilities?.decisionMaking}</span></p>
                  <p className="flex justify-between">Awareness: <span className="font-semibold">{latestEvaluation.tacticalAbilities?.gameAwareness}</span></p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-700 mb-1">Personal</p>
                  <p className="flex justify-between">Discipline: <span className="font-semibold">{latestEvaluation.personalDevelopment?.discipline}</span></p>
                  <p className="flex justify-between">Teamwork: <span className="font-semibold">{latestEvaluation.personalDevelopment?.teamwork}</span></p>
                  <p className="flex justify-between">Motivation: <span className="font-semibold">{latestEvaluation.personalDevelopment?.motivation}</span></p>
                </div>
              </div>

              {latestEvaluation.coachObservations && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-800">Coach Qualitative Note</span>
                  "{latestEvaluation.coachObservations}"
                </div>
              )}
            </div>
          )}

          {/* AI-Generated Analysis & Recommendations */}
          {aiAnalysis && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">AI-Assisted Development Analysis</h3>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {aiAnalysis.summary}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Prescribed Actionable Drills</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAnalysis.trainingRecommendations?.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-emerald-700">{rec.exerciseName}</p>
                      <p className="text-slate-600 font-medium">Target: <span className="font-normal">{rec.targetedSkill}</span></p>
                      <p className="text-slate-600 font-medium">Dose: <span className="font-normal">{rec.durationOrReps}</span></p>
                      <p className="text-slate-500 italic text-[11px]">Evidence: {rec.evaluationEvidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Note: TalentScout AI operates strictly on recorded coach evaluations and does not dispense medical advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
