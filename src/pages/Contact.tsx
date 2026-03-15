import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PolymorphicDeck from '../components/ui/PolymorphicDeck';
import { apiUrl } from '../utils/api';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  budget: string;
  projectType: string;
}

const PROJECT_TYPES = ['Web App', 'PCB Design', 'Embedded System', 'IoT Product', '3D Experience', 'Other'];
const BUDGETS = ['< $500', '$500 – $2,000', '$2,000 – $5,000', '$5,000 – $15,000', '$15,000+', 'Let\'s discuss'];

const CONTACT_INFO_CARDS = [
  { id: 'info-email', icon: '✉️', label: 'Email', value: 'engg.abdullahsaeed@gmail.com', hint: 'Best channel for project briefs and scope requests.' },
  { id: 'info-location', icon: '📍', label: 'Location', value: 'Remote — Worldwide', hint: 'Working async-friendly across time zones.' },
  { id: 'info-response', icon: '⏱', label: 'Response Time', value: 'Typically within 24 hours', hint: 'Clear next steps and delivery options.' },
];

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', subject: '', message: '', budget: '', projectType: ''
  });
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Could not submit your inquiry right now.');
      }

      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Could not submit your inquiry right now.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full bg-transparent border-b py-3 text-white outline-none transition-all duration-200 font-light placeholder:text-white/20 ${
      focused === field ? 'border-[#6366f1]' : 'border-white/15'
    }`;

  return (
    <PageWrapper>
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

            {/* Left: info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-mono text-[#6366f1]/80 text-xs uppercase tracking-[0.2em]">Get in touch</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mt-3 mb-8 tracking-tight leading-tight">
                Start Your<br />Project <span className="text-[#6366f1]">Inquiry</span>
              </h1>
              <p className="text-white/40 text-lg leading-relaxed mb-12">
                Share your requirements, timeline, and expected outcomes.
                I will respond with recommended scope, delivery approach, and next steps.
              </p>

              <PolymorphicDeck
                items={CONTACT_INFO_CARDS}
                className="mb-10"
                variant="frost"
                renderCard={(item) => (
                  <div className="p-8 min-h-[230px] flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl border border-white/10 bg-white/5">
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/50">{item.label}</span>
                    </div>
                    <div>
                      <p className="text-white text-2xl tracking-tight font-semibold">{item.value}</p>
                      <p className="text-white/55 mt-2 text-sm">{item.hint}</p>
                    </div>
                  </div>
                )}
              />

              {/* Contact details */}
              <div className="flex flex-col gap-6 mb-14">
                {[
                  { icon: '✉️', label: 'Email', value: 'engg.abdullahsaeed@gmail.com', href: 'mailto:engg.abdullahsaeed@gmail.com' },
                  { icon: '📍', label: 'Location', value: 'Remote — Worldwide', href: null },
                  { icon: '⏱', label: 'Response time', value: 'Typically within 24 hours', href: null },
                ].map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-white/30 text-[10px] font-mono uppercase tracking-[0.15em]">{label}</div>
                      {href ? (
                        <a href={href} className="text-white hover:text-[#6366f1] transition-colors">{value}</a>
                      ) : (
                        <div className="text-white">{value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-3 flex-wrap">
                {[
                  { icon: '🐙', label: 'GitHub', href: 'https://github.com', color: '#6e5494' },
                  { icon: '💼', label: 'LinkedIn', href: 'https://linkedin.com', color: '#0077b5' },
                  { icon: '🟢', label: 'Fiverr', href: 'https://fiverr.com', color: '#1dbf73' },
                  { icon: '🔷', label: 'Upwork', href: 'https://upwork.com', color: '#6fda44' },
                ].map(({ icon, label, href, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg text-[13px] flex items-center gap-2 border border-white/[0.06] hover:border-white/20 transition-all"
                    whileHover={{ y: -2 }}
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <span>{icon}</span>
                    <span className="font-mono text-white/50 text-[12px]">{label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    className="rounded-xl p-14 text-center border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="text-5xl mb-6">🚀</div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Message Sent!</h3>
                    <p className="text-white/40 mb-6 text-[13px] leading-relaxed">
                      Thanks for reaching out, {form.name.split(' ')[0]}!
                      I will get back to you with the next steps.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name:'', email:'', subject:'', message:'', budget:'', projectType:'' }); setStep(1); }}
                      className="px-5 py-2 border border-white/15 text-white/70 font-mono text-[13px] rounded-lg hover:border-white/30 hover:text-white transition-colors"
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="rounded-xl p-10 border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-white font-semibold text-base tracking-tight">New Project Inquiry</h2>
                      <div className="flex gap-1">
                        {[1, 2].map(s => (
                          <div
                            key={s}
                            className="w-6 h-1 rounded-full transition-colors duration-300"
                            style={{ background: step >= s ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
                          />
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {step === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col gap-7"
                        >
                          <div>
                            <input
                              className={inputClass('name')}
                              placeholder="Your name"
                              value={form.name}
                              onChange={e => update('name', e.target.value)}
                              onFocus={() => setFocused('name')}
                              onBlur={() => setFocused(null)}
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              className={inputClass('email')}
                              placeholder="Email address"
                              value={form.email}
                              onChange={e => update('email', e.target.value)}
                              onFocus={() => setFocused('email')}
                              onBlur={() => setFocused(null)}
                              required
                            />
                          </div>

                          <div>
                            <p className="text-white/35 text-[11px] font-mono uppercase tracking-[0.15em] mb-3">Project Type</p>
                            <div className="flex flex-wrap gap-2">
                              {PROJECT_TYPES.map(type => (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() => update('projectType', type)}
                                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all ${
                                    form.projectType === type
                                      ? 'bg-[#6366f1] text-white border-[#6366f1]'
                                      : 'text-white/45 border-white/[0.08] hover:text-white'
                                  } border`}
                                  style={form.projectType !== type ? { background: 'rgba(255,255,255,0.02)' } : {}}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-white/35 text-[11px] font-mono uppercase tracking-[0.15em] mb-3">Budget Range</p>
                            <div className="flex flex-wrap gap-2">
                              {BUDGETS.map(budget => (
                                <button
                                  type="button"
                                  key={budget}
                                  onClick={() => update('budget', budget)}
                                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-all ${
                                    form.budget === budget
                                      ? 'bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/60'
                                      : 'text-white/45 border-white/[0.08] hover:text-white'
                                  } border`}
                                  style={form.budget !== budget ? { background: 'rgba(255,255,255,0.02)' } : {}}
                                >
                                  {budget}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={!form.name || !form.email}
                            className="w-full py-2.5 bg-[#6366f1] text-white font-mono font-medium text-[13px] rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Next →
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-col gap-7"
                        >
                          <div>
                            <input
                              className={inputClass('subject')}
                              placeholder="Project subject"
                              value={form.subject}
                              onChange={e => update('subject', e.target.value)}
                              onFocus={() => setFocused('subject')}
                              onBlur={() => setFocused(null)}
                            />
                          </div>
                          <div>
                            <textarea
                              className={`${inputClass('message')} resize-none`}
                              placeholder="Tell me about your project..."
                              rows={5}
                              value={form.message}
                              onChange={e => update('message', e.target.value)}
                              onFocus={() => setFocused('message')}
                              onBlur={() => setFocused(null)}
                              required
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="px-5 py-2.5 border border-white/[0.08] text-white/50 font-mono text-[13px] rounded-lg hover:text-white transition-colors"
                              style={{ background: 'rgba(255,255,255,0.02)' }}
                            >
                              ← Back
                            </button>
                            {submitError && (
                              <p className="text-[12px] text-red-300/90 border border-red-400/30 rounded-md px-3 py-2 bg-red-500/10">
                                {submitError}
                              </p>
                            )}

                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 py-2.5 bg-[#6366f1] text-white font-mono font-medium text-[13px] rounded-lg hover:bg-[#4338ca] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {submitting ? 'Sending...' : 'Send Message ✓'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

