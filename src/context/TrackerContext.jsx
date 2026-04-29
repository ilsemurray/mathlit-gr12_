import { createContext, useContext, useState, useEffect } from "react";
import { ATP, getOverallProgress, getTermProgress, getTaughtTopics } from "../data/capsTopics";

const TrackerContext = createContext(null);

export function TrackerProvider({ children }) {
  const [trackerState, setTrackerState] = useState(() => {
    try {
      const saved = localStorage.getItem("ml_tracker_state");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("ml_tracker_state", JSON.stringify(trackerState));
  }, [trackerState]);

  const markTopicTaught = (topicId) => {
    setTrackerState((prev) => ({ ...prev, [topicId]: true }));
  };

  const markTopicNotTaught = (topicId) => {
    setTrackerState((prev) => ({ ...prev, [topicId]: false }));
  };

  const toggleTopic = (topicId) => {
    setTrackerState((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const isTopicTaught = (topicId) => !!trackerState[topicId];

  const overallProgress = getOverallProgress(trackerState);
  const taughtTopics = getTaughtTopics(trackerState);
  const termProgress = {
    1: getTermProgress(1, trackerState),
    2: getTermProgress(2, trackerState),
    3: getTermProgress(3, trackerState),
    4: getTermProgress(4, trackerState),
  };

  return (
    <TrackerContext.Provider
      value={{
        trackerState,
        markTopicTaught,
        markTopicNotTaught,
        toggleTopic,
        isTopicTaught,
        overallProgress,
        taughtTopics,
        termProgress,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used within TrackerProvider");
  return context;
}
