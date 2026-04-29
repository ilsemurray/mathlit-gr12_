import { useState } from "react";
import { useTracker } from "../context/TrackerContext";
import { useTeacher } from "../context/TeacherContext";
import { generateTopicAssessment, generateFormalAssessment, generateInvestigation } from "../services/claude";
import { ATP, getTopicById } from "../data/capsTopics";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/shared/Button";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import EmptyState from "../components/shared/EmptyState";
import { ASSESSMENT_TYPES } from "../utils/constants";
import { downloadTextFile, formatDate } from "../utils/formatters";
import { Link } from "react-router-dom";

const MODES = ["topic", "formal", "investigation"];

export default function Assessments() {
  const { teacher, isProfileComplete } = useTeacher();
  const { taughtTopics } = useTracker();
  const [mode, setMode] = useState("formal");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [term, setTerm] = useState("1");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasTaughtTopics = taughtTopics.length > 0;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      let content = "";
      if (mode === "topic") {
        const topic = getTopicById(selectedTopicId);
        if (!topic) throw new Error("Please select a topic");
        content = await generateTopicAssessment(topic, teacher);
      } else if (mode === "formal") {
        if (!hasTaughtTopics) throw new Error("No taught topics found. Mark topics as taught in the ATP Tracker first.");
        content = await generateFormalAssessment({
          assessmentType: assessmentType.label,
          taughtTopics,
          teacher,
          totalMarks: assessmentType.marks,
          duration: assessmentType.duration,
          term,
          paper: assessmentType.label.includes("Paper") ? assessmentType.label.split("Paper")[1]?.trim() : null,
        });
      } else if (mode === "investigation") {
        if (!hasTaughtTopics) throw new Error("No taught topics found.");
        content = await generateInvestigation({ taughtTopics, teacher, term });
      }
      setResult(content);
    } catch (e) {
      setError(e.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilename = () => {
    const date = new Date().toISOString().split("T")[0];
    if (mode === "topic") return `TopicAssessment_${date}.txt`;
    if (mode === "investigation") return `Investigation_Term${term}_${date}.txt`;
    return `${assessmentType.label.replace(/ /g, "_")}_Term${term}_${date}.txt`;
  };

  return (
    <PageWrapper
      title="Assessment Generator"
      subtitle="Generate CAPS-aligned assessments, memorandums, and cognitive level summaries"
    >
      {!isProfileComplete && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          ⚠️ Your teacher profile is incomplete. <Link to="/settings" className="underline font-medium">Add your credentials in Settings</Link> so assessments have the correct header.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Assessment Options</h2>

          {/* Mode selector */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Assessment Type</label>
            <div className="flex flex-col gap-2">
              {[
                { id: "formal", label: "📄 Formal Assessment", desc: "Control tests, exams (NSC-style layout)" },
                { id: "investigation", label: "🔍 Investigation / Assignment", desc: "Project-style, take-home" },
                { id: "topic", label: "📋 Topic Quiz", desc: "Quick assessment after teaching a topic" },
              ].map(({ id, label, desc }) => (
                <label key={id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${mode === id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <input type="radio" name="mode" value={id} checked={mode === id} onChange={() => setMode(id)} className="mt-0.5 accent-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Formal assessment type */}
          {mode === "formal" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Assessment Format</label>
              <select
                value={assessmentType.value}
                onChange={(e) => setAssessmentType(ASSESSMENT_TYPES.find((t) => t.value === e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} — {t.marks} marks ({t.duration})</option>
                ))}
              </select>
            </div>
          )}

          {/* Topic selector for topic quiz */}
          {mode === "topic" && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Select Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
              >
                <option value="">— Select a topic —</option>
                {ATP.map((termData) =>
                  termData.weeks.map((week) => (
                    <option key={week.id} value={week.id}>Term {termData.term}: {week.subtopic}</option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Term */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Term</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
              {[1, 2, 3, 4].map((t) => <option key={t} value={t}>Term {t}</option>)}
            </select>
          </div>

          {/* Topics summary */}
          {(mode === "formal" || mode === "investigation") && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Based on {taughtTopics.length} taught topics</label>
              {!hasTaughtTopics ? (
                <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  No topics marked as taught yet. Go to the <Link to="/tracker" className="underline">ATP Tracker</Link> to mark completed topics.
                </p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {taughtTopics.map((t) => (
                    <p key={t.id} className="text-xs text-gray-600">✓ {t.subtopic}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Credentials preview */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5 text-xs text-green-800">
            <p className="font-semibold mb-1">📋 Paper Header:</p>
            <p>{teacher.schoolName || "School Name"}</p>
            <p>{teacher.name} {teacher.surname}</p>
            <p>Grade 12 Mathematical Literacy · {teacher.year}</p>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full justify-center">
            {loading ? "Generating..." : "✨ Generate Assessment + Memo"}
          </Button>
        </div>

        {/* Output panel */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Generated Assessment</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-96">
            {loading && <LoadingSpinner message="Generating assessment and memorandum..." />}
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}
            {!loading && !error && result && (
              <>
                <div className="flex justify-end gap-2 mb-3">
                  <Button variant="secondary" onClick={() => downloadTextFile(result, getFilename())}>
                    ⬇ Download
                  </Button>
                </div>
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
              </>
            )}
            {!loading && !error && !result && (
              <EmptyState icon="📝" title="Assessment will appear here" description="Configure your options and click Generate. The memo and cognitive level summary will be included." />
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
