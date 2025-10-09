// Replace static dummy content with data-derived exports from the `data/` folder
import transcriptsRaw from '../data/transcripts_95b5d907-0d2.json';
import themesRaw from '../data/themes_95b5d907-0d2.json';
import { getColorForTheme } from '@/lib/theme-colors';
import insightsRaw from '../data/insights_transcriptions_95b5d907-0d2.json';

// Helper: safe cast
type AnyObj = any;

// Build transcripts in the shape expected by the app
export const dummyTranscripts = (transcriptsRaw as AnyObj[]).map((t) => ({
  id: String(t.id),
  session_id: String(t.session_id),
  speaker: t.speaker ?? (t.speaker_label || 'Speaker'),
  text: t.text ?? '',
  start_time: t.start_time ?? 0,
  end_time: t.end_time ?? 0,
}));

// Sessions: group transcripts by session_id to create lightweight session objects
const sessionsMap = new Map<string, AnyObj[]>();
for (const t of dummyTranscripts) {
  const sid = t.session_id || '1';
  if (!sessionsMap.has(sid)) sessionsMap.set(sid, []);
  sessionsMap.get(sid)!.push(t);
}

export const dummySessions = Array.from(sessionsMap.entries()).map(([sid, items]) => {
  // approximate duration = max end_time
  const duration = Math.max(...items.map((i) => i.end_time || 0));
  const created = items[0]?.created_at ?? undefined;
  return {
    id: sid,
    project_id: '1',
    title: `Session ${sid} - Focus Group (headphones)`,
    // point to the processed audio shipped with the repo (relative); components should handle missing file gracefully
    video_url: 'https://storage.googleapis.com/saas-videos/test/compressed.mp4',
    // Add a simple thumbnail placeholder per session (picsum provides stable images by id)
    thumbnail: `https://www.digitaltrends.com/wp-content/uploads/2023/12/dyson-zone-headphones-on-model.jpg?fit=1620%2C1080&p=1`,
    duration: Math.round(duration),
    status: 'completed',
    created_at: created ?? new Date().toISOString(),
  };
});

// Projects: create a single project reflecting the data bundle
export const dummyProjects = [
  {
    id: '1',
    name: 'Dyson Headphones Focus Group',
    client_name: 'Research Lab',
    description: 'Focus group exploring headphone preferences, use cases, and feature priorities.',
    project_type: 'Focus Group',
    sessions_count: dummySessions.length,
    created_at: new Date().toISOString().slice(0, 10),
  },
];

// Themes: aggregate by theme name from themesRaw
const themeCounts = new Map<string, { count: number; earliest: number }>();
for (const r of themesRaw as AnyObj[]) {
  const name = r.theme ?? r.theme_name ?? 'Other';
  const start = Number(r.start_time ?? 0);
  if (!themeCounts.has(name)) themeCounts.set(name, { count: 0, earliest: start || Infinity });
  const cur = themeCounts.get(name)!;
  cur.count += 1;
  if (start && start < cur.earliest) cur.earliest = start;
}

const themesArr = Array.from(themeCounts.entries()).map(([theme_name, v]) => ({ theme_name, mentions_count: v.count, earliest: v.earliest }));
const maxMentions = Math.max(...themesArr.map((t) => t.mentions_count), 1);
const minMentions = Math.min(...themesArr.map((t) => t.mentions_count), 1);

export const dummyThemes = themesArr
  .sort((a, b) => b.mentions_count - a.mentions_count)
  .slice(0, 8)
  .map((t) => ({
    theme_name: t.theme_name,
    mentions_count: t.mentions_count,
    relevance_score: minMentions === maxMentions ? 1 : (t.mentions_count - minMentions) / (maxMentions - minMentions),
    color: getColorForTheme(t.theme_name),
  }));

// Timeline markers: pick earliest mention for top themes
export const dummyTimelineMarkers = themesArr
  .sort((a, b) => a.earliest - b.earliest)
  .slice(0, 10)
  .map((t) => ({
    timestamp: Math.max(0, Math.round(t.earliest || 0)),
    marker_type: 'theme',
    label: t.theme_name,
    color: getColorForTheme(t.theme_name),
  }));


  

// Notes: derive simple notes from insightsRaw — use the first quote per theme as a note
const notes: AnyObj[] = [];
for (const entry of insightsRaw as AnyObj[]) {
  const theme = entry.theme ?? entry.theme_name ?? null;
  const insights = entry.insights ?? [];
  for (const ins of insights.slice(0, 2)) {
    const text = (ins.quotes && ins.quotes.length && ins.quotes[0]) || ins.summary || entry.detailed_analysis?.split('\n')[0] || theme || 'Insight';
    notes.push({
      id: String(ins.id ?? notes.length + 1),
      session_id: String(entry.session_id ?? 1),
      content: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
      },
      tags: Array.isArray(ins.insight_features) ? ins.insight_features.slice(0, 3) : [],
      timestamp_ref: Number(entry.start_time ?? 0) || 0,
      is_ai_generated: true,
    });
  }
}
export const dummyNotes = notes.slice(0, 20);

// Simple sentiment synthesis: light-weight heuristic over transcript text
const positiveWords = ['good', 'great', 'love', 'like', 'awesome', 'happy', 'helpful', 'useful'];
const negativeWords = ['bad', 'hate', 'problem', 'frustrat', "don't", "not", 'hard', 'issue'];

function scoreText(s: string) {
  const st = s.toLowerCase();
  let score = 0;
  for (const w of positiveWords) if (st.includes(w)) score += 1;
  for (const w of negativeWords) if (st.includes(w)) score -= 1;
  return Math.max(-1, Math.min(1, score / 3));
}

// Build sentiment points by sampling transcripts (one point per 30s window)
const maxTime = Math.max(...dummyTranscripts.map((t) => t.end_time || 0), 0);
const interval = Math.max(15, Math.round(maxTime / 8));
const sentimentPoints: AnyObj[] = [];
for (let ts = 0; ts <= maxTime; ts += interval) {
  const window = dummyTranscripts.filter((tr) => tr.start_time >= ts && tr.start_time < ts + interval);
  const combined = window.map((w) => w.text).join(' ');
  const s = combined ? scoreText(combined) : 0;
  sentimentPoints.push({
    timestamp: Math.round(ts),
    sentiment_score: s,
    sentiment_label: s > 0.2 ? 'positive' : s < -0.2 ? 'negative' : 'neutral',
    emotion: s > 0.2 ? 'positive' : s < -0.2 ? 'negative' : 'neutral',
  });
}
export const dummySentimentData = sentimentPoints;

// Summary data: product mentions aggregated from insights
const productMentions: Record<string, number> = {};
for (const entry of insightsRaw as AnyObj[]) {
  for (const ins of entry.insights ?? []) {
    for (const pm of ins.product_mentions ?? []) {
      const key = String(pm).toLowerCase();
      productMentions[key] = (productMentions[key] ?? 0) + 1;
    }
  }
}

export const dummySummaryData = {
  sentimentSplit: [
    { name: 'Positive', value: Math.round((sentimentPoints.filter((s) => s.sentiment_label === 'positive').length / Math.max(1, sentimentPoints.length)) * 100), color: '#10b981' },
    { name: 'Neutral', value: Math.round((sentimentPoints.filter((s) => s.sentiment_label === 'neutral').length / Math.max(1, sentimentPoints.length)) * 100), color: '#6b7280' },
    { name: 'Negative', value: Math.round((sentimentPoints.filter((s) => s.sentiment_label === 'negative').length / Math.max(1, sentimentPoints.length)) * 100), color: '#ef4444' },
  ],
  topEmotions: [
    { emotion: 'Positive', count: sentimentPoints.filter((s) => s.sentiment_label === 'positive').length },
    { emotion: 'Neutral', count: sentimentPoints.filter((s) => s.sentiment_label === 'neutral').length },
    { emotion: 'Negative', count: sentimentPoints.filter((s) => s.sentiment_label === 'negative').length },
  ],
  productMentions,
};

// expose raw insights for components that want richer analysis text
export const dummyInsights = insightsRaw as AnyObj[];
