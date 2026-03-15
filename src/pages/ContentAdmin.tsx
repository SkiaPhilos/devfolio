import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../components/3d/HolographicGallery';
import type { SkillNode } from '../components/3d/skillsData';
import { deleteProject, fetchAdminProjects, updateProject } from '../utils/projectApi';
import { deleteSkill, fetchAdminSkills, updateSkill } from '../utils/skillApi';

const ADMIN_KEY_STORAGE = 'devfolio_admin_key';

function readStoredAdminKey(): string {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE) || 'dev-admin-key';
  } catch {
    return 'dev-admin-key';
  }
}

function saveStoredAdminKey(value: string): void {
  try {
    localStorage.setItem(ADMIN_KEY_STORAGE, value);
  } catch {
    // ignore storage failures
  }
}

function parseCsv(input: string): string[] {
  return input
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);
}

function formatPosition(position: [number, number, number]): string {
  return position.join(', ');
}

function parsePosition(input: string): [number, number, number] {
  const parts = input
    .split(',')
    .map((token) => Number(token.trim()));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error('Position must contain exactly 3 numbers: x, y, z');
  }
  return [parts[0], parts[1], parts[2]];
}

function createProjectTemplate(): Project {
  const id = `project-${Date.now()}`;
  return {
    id,
    title: 'New Project',
    category: 'Web App',
    description: 'Describe this project with at least 10 characters.',
    tech: ['React'],
    color: '#4488ff',
    icon: '✨',
  };
}

function createSkillTemplate(): SkillNode {
  const id = `skill-${Date.now()}`;
  return {
    id,
    label: 'New Skill',
    category: 'tools',
    level: 0.5,
    position: [0, 0, 0],
    connections: [],
    description: 'Describe this skill with at least 10 characters.',
  };
}

export default function ContentAdmin() {
  const [adminKey, setAdminKey] = useState(readStoredAdminKey);
  const [tab, setTab] = useState<'projects' | 'skills'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((item) => item.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const selectedSkill = useMemo(
    () => skills.find((item) => item.id === selectedSkillId) || null,
    [skills, selectedSkillId]
  );

  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [skillDraft, setSkillDraft] = useState<SkillNode | null>(null);
  const [skillPositionInput, setSkillPositionInput] = useState('');

  async function loadProjects() {
    setStatus('Loading projects...');
    setLoading(true);
    try {
      const list = await fetchAdminProjects(adminKey);
      setProjects(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedProjectId(first.id);
        setProjectDraft(first);
      }
      setStatus(`Loaded ${list.length} project entries.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load projects';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills() {
    setStatus('Loading skills...');
    setLoading(true);
    try {
      const payload = await fetchAdminSkills(adminKey);
      setSkills(payload.skills);
      if (payload.skills.length > 0) {
        const first = payload.skills[0];
        setSelectedSkillId(first.id);
        setSkillDraft(first);
        setSkillPositionInput(formatPosition(first.position));
      }
      setStatus(`Loaded ${payload.skills.length} skill entries.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load skills';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProject() {
    if (!projectDraft) return;
    setStatus('Saving project...');
    setLoading(true);
    try {
      const saved = await updateProject(adminKey, {
        ...projectDraft,
        tech: projectDraft.tech.map((item) => item.trim()).filter(Boolean),
      });
      setProjects((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index === -1) {
          return [saved, ...prev];
        }
        return prev.map((item) => (item.id === saved.id ? saved : item));
      });
      setSelectedProjectId(saved.id);
      setProjectDraft(saved);
      setStatus(`Saved project ${saved.title}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save project';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function removeProject() {
    if (!projectDraft) return;
    const confirmed = window.confirm(`Delete project ${projectDraft.title}?`);
    if (!confirmed) return;

    setStatus('Deleting project...');
    setLoading(true);
    try {
      await deleteProject(adminKey, projectDraft.id);
      setProjects((prev) => {
        const next = prev.filter((item) => item.id !== projectDraft.id);
        const nextSelected = next[0] || null;
        setSelectedProjectId(nextSelected?.id || '');
        setProjectDraft(nextSelected);
        return next;
      });
      setStatus(`Deleted project ${projectDraft.title}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function saveSkill() {
    if (!skillDraft) return;
    setStatus('Saving skill...');
    setLoading(true);
    try {
      const saved = await updateSkill(adminKey, {
        ...skillDraft,
        position: parsePosition(skillPositionInput),
      });
      setSkills((prev) => {
        const index = prev.findIndex((item) => item.id === saved.id);
        if (index === -1) {
          return [saved, ...prev];
        }
        return prev.map((item) => (item.id === saved.id ? saved : item));
      });
      setSelectedSkillId(saved.id);
      setSkillDraft(saved);
      setSkillPositionInput(formatPosition(saved.position));
      setStatus(`Saved skill ${saved.label}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save skill';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  async function removeSkill() {
    if (!skillDraft) return;
    const confirmed = window.confirm(`Delete skill ${skillDraft.label}?`);
    if (!confirmed) return;

    setStatus('Deleting skill...');
    setLoading(true);
    try {
      await deleteSkill(adminKey, skillDraft.id);
      setSkills((prev) => {
        const next = prev.filter((item) => item.id !== skillDraft.id);
        const nextSelected = next[0] || null;
        setSelectedSkillId(nextSelected?.id || '');
        setSkillDraft(nextSelected);
        setSkillPositionInput(nextSelected ? formatPosition(nextSelected.position) : '');
        return next;
      });
      setStatus(`Deleted skill ${skillDraft.label}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete skill';
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-28 px-6 pb-20 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#6366f1]/80">Admin</span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 tracking-tight">Content Editor</h1>
        <p className="text-white/50 mt-4 max-w-2xl">
          Manage Projects and Skills records through API-backed admin endpoints.
        </p>
      </motion.div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <label className="block text-white/55 text-xs font-mono uppercase tracking-[0.16em] mb-2">Admin Key</label>
        <div className="flex gap-2">
          <input
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            className="flex-1 rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]/50"
            placeholder="x-admin-key"
          />
          <button
            onClick={() => {
              saveStoredAdminKey(adminKey.trim());
              setStatus('Admin key saved in local storage.');
            }}
            className="px-4 py-2 rounded-lg border border-[#6366f1]/30 text-[#6366f1] text-sm font-mono hover:bg-[#6366f1]/10"
          >
            Save Key
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['projects', 'skills'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-md text-sm font-mono border transition-colors ${
              tab === value
                ? 'text-[#6366f1] border-[#6366f1]/40 bg-[#6366f1]/10'
                : 'text-white/55 border-white/[0.1] hover:text-white'
            }`}
          >
            {value.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => (tab === 'projects' ? loadProjects() : loadSkills())}
          disabled={loading}
          className="ml-auto px-4 py-2 rounded-md text-sm font-mono border border-white/[0.14] text-white/75 hover:text-white disabled:opacity-50"
        >
          {loading ? 'Working...' : `Load ${tab}`}
        </button>
        <button
          onClick={() => {
            if (tab === 'projects') {
              const created = createProjectTemplate();
              setProjectDraft(created);
              setSelectedProjectId(created.id);
            } else {
              const created = createSkillTemplate();
              setSkillDraft(created);
              setSelectedSkillId(created.id);
              setSkillPositionInput(formatPosition(created.position));
            }
            setStatus('New draft created. Save to persist.');
          }}
          className="px-4 py-2 rounded-md text-sm font-mono border border-[#6366f1]/35 text-[#6366f1] hover:bg-[#6366f1]/10"
        >
          New {tab === 'projects' ? 'Project' : 'Skill'}
        </button>
      </div>

      {tab === 'projects' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 max-h-[65vh] overflow-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setProjectDraft(project);
                }}
                className={`w-full text-left p-3 rounded-lg border mb-2 transition-colors ${
                  selectedProjectId === project.id
                    ? 'border-[#6366f1]/45 bg-[#6366f1]/10'
                    : 'border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                <p className="text-white text-sm font-medium">{project.title}</p>
                <p className="text-white/45 text-xs mt-1">{project.category}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            {!selectedProject || !projectDraft ? (
              <p className="text-white/45">Load projects and select one to edit.</p>
            ) : (
              <div className="space-y-4">
                <Field label="ID" value={projectDraft.id} onChange={(value) => setProjectDraft({ ...projectDraft, id: value })} />
                <Field label="Title" value={projectDraft.title} onChange={(value) => setProjectDraft({ ...projectDraft, title: value })} />
                <Field label="Category" value={projectDraft.category} onChange={(value) => setProjectDraft({ ...projectDraft, category: value })} />
                <Field label="Color" value={projectDraft.color} onChange={(value) => setProjectDraft({ ...projectDraft, color: value })} />
                <Field label="Icon" value={projectDraft.icon} onChange={(value) => setProjectDraft({ ...projectDraft, icon: value })} />
                <Field
                  label="Tech (comma separated)"
                  value={projectDraft.tech.join(', ')}
                  onChange={(value) => setProjectDraft({ ...projectDraft, tech: parseCsv(value) })}
                />
                <TextArea
                  label="Description"
                  value={projectDraft.description}
                  onChange={(value) => setProjectDraft({ ...projectDraft, description: value })}
                />
                <button
                  onClick={saveProject}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-[#6366f1]/35 text-[#6366f1] hover:bg-[#6366f1]/10 disabled:opacity-50"
                >
                  Save Project
                </button>
                <button
                  onClick={removeProject}
                  disabled={loading}
                  className="ml-2 px-4 py-2 rounded-md border border-white/[0.22] text-white/75 hover:text-white hover:border-white/[0.35] disabled:opacity-50"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 max-h-[65vh] overflow-auto">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => {
                  setSelectedSkillId(skill.id);
                  setSkillDraft(skill);
                  setSkillPositionInput(formatPosition(skill.position));
                }}
                className={`w-full text-left p-3 rounded-lg border mb-2 transition-colors ${
                  selectedSkillId === skill.id
                    ? 'border-[#6366f1]/45 bg-[#6366f1]/10'
                    : 'border-white/[0.08] hover:border-white/[0.2]'
                }`}
              >
                <p className="text-white text-sm font-medium">{skill.label}</p>
                <p className="text-white/45 text-xs mt-1">{skill.category}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            {!selectedSkill || !skillDraft ? (
              <p className="text-white/45">Load skills and select one to edit.</p>
            ) : (
              <div className="space-y-4">
                <Field label="ID" value={skillDraft.id} onChange={(value) => setSkillDraft({ ...skillDraft, id: value })} />
                <Field label="Label" value={skillDraft.label} onChange={(value) => setSkillDraft({ ...skillDraft, label: value })} />
                <Field label="Category" value={skillDraft.category} onChange={(value) => setSkillDraft({ ...skillDraft, category: value })} />
                <Field
                  label="Level (0-1)"
                  value={String(skillDraft.level)}
                  onChange={(value) => setSkillDraft({ ...skillDraft, level: Number(value) || 0 })}
                />
                <Field
                  label="Position (x, y, z)"
                  value={skillPositionInput}
                  onChange={setSkillPositionInput}
                />
                <Field
                  label="Connections (comma separated IDs)"
                  value={skillDraft.connections.join(', ')}
                  onChange={(value) => setSkillDraft({ ...skillDraft, connections: parseCsv(value) })}
                />
                <TextArea
                  label="Description"
                  value={skillDraft.description}
                  onChange={(value) => setSkillDraft({ ...skillDraft, description: value })}
                />
                <button
                  onClick={saveSkill}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-[#6366f1]/35 text-[#6366f1] hover:bg-[#6366f1]/10 disabled:opacity-50"
                >
                  Save Skill
                </button>
                <button
                  onClick={removeSkill}
                  disabled={loading}
                  className="ml-2 px-4 py-2 rounded-md border border-white/[0.22] text-white/75 hover:text-white hover:border-white/[0.35] disabled:opacity-50"
                >
                  Delete Skill
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-white/55">{status}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-white/45 mb-2">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/[0.1] bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]/45"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-white/45 mb-2">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-white/[0.1] bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-[#6366f1]/45"
      />
    </label>
  );
}


