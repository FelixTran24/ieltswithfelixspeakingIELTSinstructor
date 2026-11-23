import { useEffect, useState } from 'react';
import { BandDescriptorsView } from './components/BandDescriptorsView';
import { Header } from './components/Header';
import { HistoryProgress } from './components/HistoryProgress';
import { PracticeRoom } from './components/PracticeRoom';
import { QuestionBank } from './components/QuestionBank';
import type {
  ActiveTab,
  ExaminerVoice,
  PracticeSession,
  SpeakingPart,
  TopicSet,
} from './types/ielts';
import {
  deleteRecordingBlob,
  loadHistory,
  loadTopics,
  saveHistory,
  saveTopics,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');
  const [topics, setTopics] = useState<TopicSet[]>(() => loadTopics());
  const [history, setHistory] = useState<PracticeSession[]>(() => loadHistory());
  const [voice, setVoice] = useState<ExaminerVoice>('Kore');
  const [blindLaunchRequest, setBlindLaunchRequest] = useState<{
    nonce: number;
    topicId?: string;
    part?: SpeakingPart | 'all';
  } | null>(null);

  // Support optional ?tab= query parameter for direct deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (
      tabParam === 'practice' ||
      tabParam === 'bank' ||
      tabParam === 'history' ||
      tabParam === 'descriptors'
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleUpdateTopics = (updated: TopicSet[]) => {
    setTopics(updated);
    saveTopics(updated);
  };

  const handleSessionCompleted = (session: PracticeSession) => {
    setHistory((prev) => {
      const next = [session, ...prev];
      saveHistory(next);
      return next;
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setHistory((prev) => {
      const next = prev.filter((s) => s.id !== sessionId);
      saveHistory(next);
      return next;
    });
    void deleteRecordingBlob(sessionId);
  };

  const handleStartRandomBlindExam = () => {
    setActiveTab('practice');
    setBlindLaunchRequest({ nonce: Date.now(), part: 'all' });
  };

  const handlePracticeTopicBlind = (topicId: string) => {
    setActiveTab('practice');
    setBlindLaunchRequest({ nonce: Date.now(), topicId });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8FA] text-[#2A1A22]">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onStartBlindExam={handleStartRandomBlindExam}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'practice' && (
          <PracticeRoom
            topics={topics}
            voice={voice}
            onVoiceChange={setVoice}
            onSessionCompleted={handleSessionCompleted}
            blindLaunchRequest={blindLaunchRequest}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBank
            topics={topics}
            onSaveTopics={handleUpdateTopics}
            onPracticeTopicBlind={handlePracticeTopicBlind}
          />
        )}

        {activeTab === 'history' && (
          <HistoryProgress
            sessions={history}
            voice={voice}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'descriptors' && <BandDescriptorsView />}
      </main>

      <footer className="border-t border-[#F3DCE5] bg-white/90 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7A606D]">
          <span className="font-medium text-[#5A424E]">
            IELTS WITH FELIX · Luyện tập IELTS Speaking chuẩn giám khảo
          </span>
          <span>Dữ liệu lịch sử & bản ghi âm được lưu trữ cục bộ an toàn trên trình duyệt của bạn</span>
        </div>
      </footer>
    </div>
  );
}
