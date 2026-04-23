import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const STORAGE_KEY = 'ncd_workbook_v1';

// Context so TA can live outside the component (prevents focus-loss on each keystroke)
const WorkbookCtx = React.createContext(null);

const TA = ({ name, className = '', placeholder = '', rows = 4 }) => {
  const { form, handleChange } = React.useContext(WorkbookCtx);
  return (
    <textarea
      name={name}
      className={className}
      placeholder={placeholder}
      rows={rows}
      value={form[name] || ''}
      onChange={handleChange}
    />
  );
};

const INITIAL_FORM = {
  // Identity
  name: '', company: '', status: '',
  // M1
  m1_interview1: '', m1_interview2: '', m1_postofferEmail: '', m1_prestart: '', m1_takeaway: '',
  // M2
  m2_observe1: '', m2_observe2: '', m2_observe3: '', m2_observe4: '',
  m2_micro1: '', m2_micro2: '', m2_micro3: '', m2_takeaway: '',
  // M3
  m3_scenario: '', m3_firstmove: '', m3_questions: '', m3_mistake: '', m3_phrases: '', m3_takeaway: '',
  // M4
  m4_rewrite1: '', m4_rewrite2: '', m4_rewrite3: '',
  m4_phrases1: '', m4_phrases2: '', m4_takeaway: '',
  // Commitments
  close_c1: '', close_c2: '', close_c3: '',
};

const TABS = [
  { id: 'm1',     mod: '1',     label: 'The Last Mile' },
  { id: 'm2',     mod: '2',     label: 'Day 1' },
  { id: 'm3',     mod: '3',     label: 'Figure It Out' },
  { id: 'm4',     mod: '4',     label: 'Managing Up' },
  { id: 'mclose', mod: 'close', label: 'My Commitments' },
];

export default function Workbook() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [activeTab, setActiveTab] = useState(0);
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [saveVisible, setSaveVisible] = useState(false);
  const saveTimerRef = useRef(null);
  const saveIndicatorTimerRef = useRef(null);

  // ── LOAD from localStorage ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setForm(prev => ({ ...prev, ...saved }));
      }
    } catch (e) {}
  }, []);

  // ── AUTOSAVE to localStorage ───────────────────────────────────────────
  const triggerSave = useCallback((data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    setSaveVisible(true);
    clearTimeout(saveIndicatorTimerRef.current);
    saveIndicatorTimerRef.current = setTimeout(() => setSaveVisible(false), 1800);
  }, []);

  const scheduleAutosave = useCallback((data) => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => triggerSave(data), 800);
  }, [triggerSave]);

  // ── CHANGE HANDLER ─────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      scheduleAutosave(next);
      return next;
    });
  }, [scheduleAutosave]);

  // ── PROGRESS ───────────────────────────────────────────────────────────
  const textareaFields = Object.keys(INITIAL_FORM).filter(k => !['name', 'company', 'status'].includes(k));
  const filled = textareaFields.filter(k => (form[k] || '').trim().length > 5).length;
  const progress = Math.round((filled / textareaFields.length) * 100);

  // ── TAB SWITCH ─────────────────────────────────────────────────────────
  const switchTab = (idx) => {
    setActiveTab(idx);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── SUBMIT ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitState('success');
      } else {
        setSubmitState('error');
        setErrorMsg(json.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitState('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <WorkbookCtx.Provider value={{ form, handleChange }}>
    <>
      <Head>
        <title>Navigate. Communicate. Deliver. — Student Workbook</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* ── TOP BAR ─────────────────────────────────────────────────── */}
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-title">
            <span>Navigate. Communicate. Deliver.</span> — Student Workbook
          </div>
          <div className="topbar-right">
            <div className="progress-wrap">
              <span className="progress-label">Filled</span>
              <div className="progress-bar-outer">
                <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-pct">{progress}%</span>
            </div>
            <button className="btn-print" onClick={() => window.print()}>⊞ Print / Save PDF</button>
          </div>
        </div>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-tag">Student Workbook</div>
          <h1>Navigate. Communicate. Deliver.</h1>
          <p className="hero-sub">Professional Communication for Your First Apprenticeship &nbsp;|&nbsp; Year 1 &nbsp;|&nbsp; 90 Minutes</p>
          <div className="student-details">
            <div className="detail-field">
              <label>Your Name</label>
              <input type="text" name="name" placeholder="Full name" autoComplete="off" value={form.name} onChange={handleChange} />
            </div>
            <div className="detail-field">
              <label>Apprenticeship Company</label>
              <input type="text" name="company" placeholder="Company name or TBD" autoComplete="off" value={form.company} onChange={handleChange} />
            </div>
            <div className="detail-field">
              <label>My Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="">Select status...</option>
                <option value="locked">Locked in — company confirmed</option>
                <option value="conversations">In final conversations</option>
                <option value="applying">Still actively applying</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────── */}
      <div className="tabs-wrap">
        <div className="tabs">
          {TABS.map((tab, idx) => (
            <button
              key={tab.id}
              className={`tab${activeTab === idx ? ' active' : ''}`}
              data-mod={tab.mod}
              onClick={() => switchTab(idx)}
            >
              <div className="tab-dot">{tab.mod === 'close' ? '★' : `M${tab.mod}`}</div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────── */}
      <div className="main">

        {/* ════ MODULE 1: THE LAST MILE ════ */}
        {activeTab === 0 && (
          <div>
            <div className="mod-header m1">
              <div className="mod-num">1</div>
              <div className="mod-header-text">
                <h2>The Last Mile</h2>
                <p>Interview questions that trip people up + communicating after you get the offer</p>
              </div>
            </div>

            <div className="card">
              <div className="card-title orange">The 3-Part Answer Formula</div>
              <div className="framework orange">
                <div className="fw-header">Use this for any tough interview question about experience or fit</div>
                <div className="fw-step">
                  <div className="fw-key">1. Acknowledge</div>
                  <div className="fw-desc"><strong>Name the gap — then reframe it</strong>Don't get defensive. Show self-awareness that the gap is real, then explain what you've done about it.</div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">2. Evidence</div>
                  <div className="fw-desc"><strong>Give one specific story or moment</strong>Not "I'm a fast learner." But: "During my LE Year 1 project, I..." — specifics are 10× more memorable than adjectives.</div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">3. Forward-Look</div>
                  <div className="fw-desc"><strong>End with what you're building toward</strong>Show that this role connects to a real direction for you. They want to see it matters for genuine reasons.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title orange">Practice — Interview Questions</div>
              <div className="scenario-box">
                <div className="scenario-label">Interview Scenario 1</div>
                "Your CV is quite thin. You don't have much professional experience. Why should we pick you over someone who has done this before?"
              </div>
              <div className="compare-grid">
                <div className="compare-weak">
                  <div className="compare-label">WEAK — What most people say</div>
                  <div className="compare-text">"I know I don't have a lot of experience, but I'm a fast learner and very motivated. I'll work hard and pick things up quickly." <br /><br /><em style={{ color: '#cc3333', fontSize: '12px' }}>Forgettable. Every candidate says this.</em></div>
                </div>
                <div className="compare-strong">
                  <div className="compare-label">BETTER — What you should do</div>
                  <div className="compare-text">Acknowledge the gap → give one specific project or moment from LE Year 1 → forward-look to what you're building toward in this role.</div>
                </div>
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Write YOUR version of the answer using the 3-Part Formula:</div>
                <div className="prompt-hint">Be specific — reference a real project, outcome, or moment from your Year 1.</div>
                <TA name="m1_interview1" className="orange" placeholder={"1. Acknowledge + reframe: ...\n2. Specific evidence from my Year 1: ...\n3. Forward-look — why this role connects: ..."} rows={5} />
              </div>

              <div className="section-divider">Interview Scenario 2</div>
              <div className="scenario-box">
                <div className="scenario-label">Interview Scenario 2</div>
                "Tell me something about yourself that's not on your CV."
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What would you say? (Aim for something authentic — a habit, perspective, or experience that's genuinely you):</div>
                <TA name="m1_interview2" className="orange" placeholder="I'd share..." rows={4} />
              </div>
            </div>

            <div className="card">
              <div className="card-title orange">Post-Offer Communication</div>
              <div className="info-box orange">
                <strong>For those who are locked in:</strong> Your first email to the company after receiving an offer sets the tone for the entire relationship. Professional tone, specific dates, and a line about what you'll do to prepare goes a long way.
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Draft your professional offer confirmation email:</div>
                <div className="prompt-hint">Subject line + body. Include: thank you, confirm acceptance, start date, and what you'll prepare before Day 1.</div>
                <TA name="m1_postofferEmail" className="orange" placeholder={"Subject: \n\nDear [Name],\n\nThank you for offering me the position. I'm genuinely excited about the opportunity to..."} rows={8} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What's one thing you want to confirm or prepare before Day 1? Write it as a brief professional message to your manager:</div>
                <TA name="m1_prestart" className="orange" placeholder="Hi [Name], I wanted to reach out ahead of my start date to..." rows={4} />
              </div>
            </div>

            <div className="card">
              <div className="card-title orange">My Takeaway — Module 1</div>
              <div className="prompt-block">
                <div className="prompt-q">The one phrase or principle from this module I'll actually remember and use:</div>
                <TA name="m1_takeaway" className="orange" placeholder="..." rows={3} />
              </div>
            </div>

            <div className="nav-buttons">
              <button className="btn-nav btn-prev" disabled>← Back</button>
              <button className="btn-nav btn-next orange" onClick={() => switchTab(1)}>Module 2: Day 1 →</button>
            </div>
          </div>
        )}

        {/* ════ MODULE 2: DAY 1 ════ */}
        {activeTab === 1 && (
          <div>
            <div className="mod-header m2">
              <div className="mod-num">2</div>
              <div className="mod-header-text">
                <h2>Day 1 in a Foreign Land</h2>
                <p>Navigating a professional environment that feels nothing like LE</p>
              </div>
            </div>

            <div className="card">
              <div className="card-title teal">The O-C-A Framework</div>
              <div className="framework teal">
                <div className="fw-header">Your default mode for the first week</div>
                <div className="fw-step">
                  <div className="fw-key">OBSERVE</div>
                  <div className="fw-desc"><strong>Days 1–2: Watch before you act</strong>How do people communicate? What's the energy? Who speaks in meetings — and who doesn't? You're collecting data, not hiding.</div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">CALIBRATE</div>
                  <div className="fw-desc"><strong>Days 3–5: Match the environment's layer</strong>Adjust your formality level to match the room. You're adding a professional layer — not losing yourself.</div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">ACT</div>
                  <div className="fw-desc"><strong>Week 2+: Contribute with confidence</strong>Once you've read the room, your perspective has value. Insight delivered after trust is built lands very differently.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title teal">Environment Observation Sheet</div>
              <div className="info-box teal">Answer these as if it's your first morning at your apprenticeship company. If you're already locked in, try to answer based on what you know about them.</div>
              <div className="prompt-block">
                <div className="prompt-q">What's the first thing I'd notice when I walk in that tells me about the culture?</div>
                <TA name="m2_observe1" className="teal" placeholder="The physical space, how people interact, dress code, energy level..." rows={3} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">How would I figure out how to address my manager — by first name, title, or something else?</div>
                <TA name="m2_observe2" className="teal" placeholder="I'd watch how others address them, or simply ask: 'How do you prefer I address you?'" rows={3} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What's my plan for the first 48 hours to understand how communication works here?</div>
                <TA name="m2_observe3" className="teal" placeholder="E.g. observe what channels people use for what, how formal emails are, whether there are standup meetings..." rows={4} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What do I do the first time I'm asked to do something I've never done before?</div>
                <TA name="m2_observe4" className="teal" placeholder="My default response: ..." rows={3} />
              </div>
            </div>

            <div className="card">
              <div className="card-title teal">Scenario: The Micromanaging Manager</div>
              <div className="scenario-box" style={{ borderLeftColor: 'var(--teal)' }}>
                <div className="scenario-label" style={{ color: 'var(--teal)' }}>Scenario</div>
                Your manager checks in on every task. They ask for updates multiple times a day. You feel frustrated and like they don't trust you.
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What's the instinctive (but wrong) reaction most people have?</div>
                <TA name="m2_micro1" className="teal" placeholder="..." rows={2} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Using O-C-A, what would a smarter approach look like?</div>
                <TA name="m2_micro2" className="teal" placeholder={"Observe: what is driving their behaviour?\nCalibrate: how can I proactively meet their need?\nAct: what would I do differently?"} rows={4} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Write a proactive update message you could send your manager to reduce the need for check-ins:</div>
                <div className="prompt-hint">Example: "Just to keep you in the loop — I've completed X and I'm moving to Y. Will have a draft for you by [time]."</div>
                <TA name="m2_micro3" className="teal" placeholder="Hi [Name], just a quick update: ..." rows={4} />
              </div>
            </div>

            <div className="card">
              <div className="card-title teal">My Takeaway — Module 2</div>
              <div className="prompt-block">
                <div className="prompt-q">The one behaviour I'll adopt in my first week because of this module:</div>
                <TA name="m2_takeaway" className="teal" placeholder="..." rows={3} />
              </div>
            </div>

            <div className="nav-buttons">
              <button className="btn-nav btn-prev" onClick={() => switchTab(0)}>← Module 1</button>
              <button className="btn-nav btn-next teal" onClick={() => switchTab(2)}>Module 3: Figure It Out →</button>
            </div>
          </div>
        )}

        {/* ════ MODULE 3: FIGURE IT OUT ════ */}
        {activeTab === 2 && (
          <div>
            <div className="mod-header m3">
              <div className="mod-num">3</div>
              <div className="mod-header-text">
                <h2>When the Task is "Figure It Out"</h2>
                <p>The most important professional skill you can develop right now</p>
              </div>
            </div>

            <div className="card">
              <div className="card-title purple">The Clarify-Before-You-Act Framework</div>
              <div className="info-box purple">The most common failure in early apprenticeships isn't poor work — it's starting the wrong thing confidently. Ask these 5 questions before beginning any vague task.</div>
              <div className="framework purple">
                <div className="fw-header">5 Questions to ask before starting any vague task</div>
                <div className="fw-step">
                  <div className="fw-key">Q1</div>
                  <div className="fw-desc"><strong>What does success look like?</strong><em>"What would a great version of this be for you?"</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">Q2</div>
                  <div className="fw-desc"><strong>What's the deadline — hard or rough target?</strong><em>"Is Friday a firm deadline or more of a rough target?"</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">Q3</div>
                  <div className="fw-desc"><strong>What resources / access do I have?</strong><em>Tools, data, budget, people you can speak to</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">Q4</div>
                  <div className="fw-desc"><strong>Who else has context I should speak to first?</strong><em>"Is there someone internally who has already worked on this?"</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">Q5</div>
                  <div className="fw-desc"><strong>Can I share a quick plan before I start?</strong><em>3 bullets confirming direction. Catches misalignment before it costs 3 days.</em></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title purple">Scenario Activity — Your Group's Card</div>
              <div className="info-box purple">Your group has been given one scenario card. Answer the three questions below for your scenario. You'll rotate to a second scenario after 4 minutes.</div>
              <div className="prompt-block">
                <div className="prompt-q">Which scenario did your group get? (Write a brief description):</div>
                <TA name="m3_scenario" className="purple" placeholder="We got Scenario Card ___ : ..." rows={2} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What's your FIRST MOVE? Not the solution — the first communication step:</div>
                <TA name="m3_firstmove" className="purple" placeholder="Before doing any research or work, my first move would be to..." rows={3} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Write 2 clarifying questions you would actually send to your manager:</div>
                <TA name="m3_questions" className="purple" placeholder={"Question 1: ...\n\nQuestion 2: ..."} rows={5} />
              </div>
              <div className="prompt-block">
                <div className="prompt-q">What mistake would most students make on this task?</div>
                <TA name="m3_mistake" className="purple" placeholder="Most students would..." rows={3} />
              </div>
            </div>

            <div className="card">
              <div className="card-title purple">My Go-To Clarifying Questions</div>
              <div className="prompt-block">
                <div className="prompt-q">Write 3 clarifying question phrases you'll actually use when given a vague task:</div>
                <TA name="m3_phrases" className="purple" placeholder={"1. Before I start, I'd ask: ...\n\n2. To make sure I'm solving the right problem: ...\n\n3. ..."} rows={6} />
              </div>
            </div>

            <div className="card">
              <div className="card-title purple">My Takeaway — Module 3</div>
              <div className="prompt-block">
                <div className="prompt-q">The one shift in how I'll approach a vague task from now on:</div>
                <TA name="m3_takeaway" className="purple" placeholder="..." rows={3} />
              </div>
            </div>

            <div className="nav-buttons">
              <button className="btn-nav btn-prev" onClick={() => switchTab(1)}>← Module 2</button>
              <button className="btn-nav btn-next purple" onClick={() => switchTab(3)}>Module 4: Managing Up →</button>
            </div>
          </div>
        )}

        {/* ════ MODULE 4: MANAGING UP ════ */}
        {activeTab === 3 && (
          <div>
            <div className="mod-header m4">
              <div className="mod-num">4</div>
              <div className="mod-header-text">
                <h2>Managing Up Professionally</h2>
                <p>Requests, leave, expectations — this is a skill, not a personality trait</p>
              </div>
            </div>

            <div className="card">
              <div className="card-title green">The Professional Request Formula</div>
              <div className="info-box green">Most students communicate professional needs in "information mode." Shifting to "request mode" is simple — but almost nobody does it naturally at first.</div>
              <div className="framework green">
                <div className="fw-header">Use for: leave, overwhelm, delays, asking for help — any professional ask</div>
                <div className="fw-step">
                  <div className="fw-key">1. Context</div>
                  <div className="fw-desc"><strong>1 line — no over-explaining</strong><em>E.g. "I have a prior family commitment"</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">2. The Ask</div>
                  <div className="fw-desc"><strong>Specific — exact dates, actions, what you need</strong><em>E.g. "Would it be okay if I took this Friday off?"</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">3. Cover</div>
                  <div className="fw-desc"><strong>What you'll do so your absence doesn't create problems</strong><em>E.g. "I'll have X ready before I leave Thursday."</em></div>
                </div>
                <div className="fw-step">
                  <div className="fw-key">4. Confirm</div>
                  <div className="fw-desc"><strong>Leave the door open without undermining your ask</strong><em>E.g. "Let me know if this works, happy to adjust if needed."</em></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title green">Rewrite the Message</div>
              <div className="info-box green">Rewrite each message below using the Professional Request Formula. The original messages are in "information mode" — your rewrites should be in "request mode."</div>

              <div className="section-divider">Message 1 — Leave Request</div>
              <div className="scenario-box" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="scenario-label" style={{ color: 'var(--green)' }}>Original (Weak)</div>
                "Hi sir, I just wanted to say that I have a family function on Saturday and Sunday and I won't be able to come. Hope that's okay."
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Your rewrite:</div>
                <TA name="m4_rewrite1" className="green" placeholder={"Hi [Name],\n\nI have a prior family commitment this weekend..."} rows={5} />
              </div>

              <div className="section-divider">Message 2 — Overwhelmed</div>
              <div className="scenario-box" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="scenario-label" style={{ color: 'var(--green)' }}>Original (Weak)</div>
                "Hi, I have too many things to do right now and I'm not sure I can finish everything you gave me by the deadline."
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Your rewrite:</div>
                <TA name="m4_rewrite2" className="green" placeholder={"Hi [Name],\n\nI want to flag that I'm currently working across several tasks..."} rows={5} />
              </div>

              <div className="section-divider">Message 3 — Client Outreach</div>
              <div className="scenario-box" style={{ borderLeftColor: 'var(--green)' }}>
                <div className="scenario-label" style={{ color: 'var(--green)' }}>Original (Weak) — sent via WhatsApp</div>
                "Hi, my name is [Name] and I'm working with [Company]. I wanted to reach out. Please let me know if you're interested."
              </div>
              <div className="prompt-block">
                <div className="prompt-q">Your rewrite (also consider: is WhatsApp the right channel? What's missing from this message?):</div>
                <TA name="m4_rewrite3" className="green" placeholder={"My rewrite + channel thoughts:\n\n..."} rows={6} />
              </div>
            </div>

            <div className="card">
              <div className="card-title green">My Professional Phrase Bank</div>
              <div className="two-col-prompts">
                <div className="prompt-block">
                  <div className="prompt-q">3 phrases I'll use for vague tasks:</div>
                  <TA name="m4_phrases1" className="green" placeholder={"1. ...\n2. ...\n3. ..."} rows={5} />
                </div>
                <div className="prompt-block">
                  <div className="prompt-q">3 phrases I'll use for managing up:</div>
                  <TA name="m4_phrases2" className="green" placeholder={"1. ...\n2. ...\n3. ..."} rows={5} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title green">My Takeaway — Module 4</div>
              <div className="prompt-block">
                <div className="prompt-q">The one communication habit I'm committing to change after this module:</div>
                <TA name="m4_takeaway" className="green" placeholder="..." rows={3} />
              </div>
            </div>

            <div className="nav-buttons">
              <button className="btn-nav btn-prev" onClick={() => switchTab(2)}>← Module 3</button>
              <button className="btn-nav btn-next" onClick={() => switchTab(4)}>My Commitments →</button>
            </div>
          </div>
        )}

        {/* ════ COMMITMENTS ════ */}
        {activeTab === 4 && (
          <div>
            <div className="mod-header close-h">
              <div className="mod-num">★</div>
              <div className="mod-header-text">
                <h2>My 3 Communication Commitments</h2>
                <p>Not "communicate better" — specific, observable things you will do differently in your apprenticeship</p>
              </div>
            </div>

            <div className="info-box orange" style={{ fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' }}>
              <strong>The standard:</strong> A commitment is not "I will communicate better." A commitment is: <em>"When I receive a vague task, I will ask Q1 and Q5 from the Clarify-Before-You-Act framework before I start any work."</em> That's specific, observable, and testable.
            </div>

            <div className="commitment-card">
              <div className="commitment-header c1">Commitment 1</div>
              <div className="commitment-body">
                <div className="prompt-block">
                  <div className="prompt-q">What will I do differently?</div>
                  <TA name="close_c1" placeholder="When [situation], I will [specific action]..." rows={3} />
                </div>
              </div>
            </div>

            <div className="commitment-card">
              <div className="commitment-header c2">Commitment 2</div>
              <div className="commitment-body">
                <div className="prompt-block">
                  <div className="prompt-q">What will I do differently?</div>
                  <TA name="close_c2" placeholder="When [situation], I will [specific action]..." rows={3} />
                </div>
              </div>
            </div>

            <div className="commitment-card">
              <div className="commitment-header c3">Commitment 3</div>
              <div className="commitment-body">
                <div className="prompt-block">
                  <div className="prompt-q">What will I do differently?</div>
                  <TA name="close_c3" placeholder="When [situation], I will [specific action]..." rows={3} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '24px', background: 'var(--navy)', border: 'none' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: '1.8', textAlign: 'center', padding: '8px 0' }}>
                Share Commitment 1 with the person next to you.<br />
                <strong style={{ color: 'var(--orange)' }}>Then share it with the room.</strong>
              </div>
            </div>

            {/* Submit section */}
            {submitState !== 'success' && (
              <>
                <button
                  className={`btn-submit${submitState === 'loading' ? ' loading' : ''}`}
                  onClick={handleSubmit}
                  disabled={submitState === 'loading'}
                >
                  {submitState === 'loading' ? 'Submitting...' : 'Submit My Responses →'}
                </button>
                {submitState === 'error' && (
                  <div className="error-banner">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </div>
                )}
              </>
            )}

            {submitState === 'success' && (
              <div className="success-banner">
                <h3>Responses submitted!</h3>
                <p>Your workbook has been saved. You can still print or save as PDF using the button in the top bar.<br />
                Good luck with your apprenticeship — you're more prepared than you think.</p>
              </div>
            )}

            <div className="nav-buttons">
              <button className="btn-nav btn-prev" onClick={() => switchTab(3)}>← Module 4</button>
              <button className="btn-nav btn-next" onClick={() => window.print()}>Print / Save PDF ⊞</button>
            </div>
          </div>
        )}

      </div>

      {/* Autosave indicator */}
      <div className={`save-indicator${saveVisible ? ' show' : ''}`}>Saved locally ✓</div>
    </>
    </WorkbookCtx.Provider>
  );
}
