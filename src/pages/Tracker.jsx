import { useState } from "react";
import { ATP } from "../data/capsTopics";
import { useTracker } from "../context/TrackerContext";
import PageWrapper from "../components/layout/PageWrapper";
import { TOPIC_COLORS } from "../utils/constants";
import { formatWeeks } from "../utils/formatters";

function TopicRow({ week, term }) {
  const { isTopicTaught, toggleTopic } = useTracker();
  const taught = isTopicTaught(week.id);
  const topicColor = TOPIC_COLORS[week.topic] || "bg-gray-50 border-gray-200";

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-4 transition-all ${taught ? "bg-green-50 border-green-300" : `${topicColor}`}`}>
      <input
        type="checkbox"
        checked={taught}
        onChange={() => toggleTopic(week.id)}
        className="mt-1 w-4 h-4 accent-green-600 cursor-pointer flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">{formatWeeks(week.weekStart, week.weekEnd)}</span>
          <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600">{week.topic}</span>
          {week.cognitiveLevel.map((l) => (
            <span key={l} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{l}</span>
          ))}
        </div>
        <p className="font-medium text-gray-800">{week.subtopic}</p>
        <p className="text-xs text-gray-500 mt-0.5">{week.capsRef}</p>
      </div>
      {taught && <span className="text-green-600 text-sm font-medium flex-shrink-0">✓ Taught</span>}
    </div>
  );
}

export default function Tracker() {
  const [activeTerm, setActiveTerm] = useState(1);
  const { termProgress } = useTracker();

  const termData = ATP.find((t) => t.term === activeTerm);

  return (
    <PageWrapper
      title="ATP Tracker"
      subtitle="Mark topics as taught to track your progress against the Annual Teaching Plan"
    >
      {/* Term Tabs */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((term) => (
          <button
            key={term}
            onClick={() => setActiveTerm(term)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTerm === term
                ? "bg-green-700 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
            }`}
          >
            Term {term}
            <span className={`ml-2 text-xs ${activeTerm === term ? "text-green-200" : "text-gray-400"}`}>
              {termProgress[term]}%
            </span>
          </button>
        ))}
      </div>

      {/* Progress bar for active term */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Term {activeTerm} Progress</span>
          <span>{termProgress[activeTerm]}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${termProgress[activeTerm]}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{termData?.totalWeeks} teaching weeks · {termData?.weeks.length} topics</p>
      </div>

      {/* Topics */}
      <div className="flex flex-col gap-3">
        {termData?.weeks.map((week) => (
          <TopicRow key={week.id} week={week} term={activeTerm} />
        ))}
      </div>
    </PageWrapper>
  );
}
