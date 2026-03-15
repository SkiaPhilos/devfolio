import type { SkillNode } from '../components/3d/skillsData';
import { apiUrl } from './api';

export type SkillsPayload = {
  skills: SkillNode[];
  categoryColors: Record<string, string>;
};

export async function fetchSkills(): Promise<SkillsPayload> {
  const response = await fetch(apiUrl('/api/skills'));

  if (!response.ok) {
    throw new Error('Failed to fetch skills');
  }

  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.skills) || typeof payload.categoryColors !== 'object') {
    throw new Error('Invalid skills payload');
  }

  return {
    skills: payload.skills,
    categoryColors: payload.categoryColors,
  };
}

function adminHeaders(adminKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
  };
}

export async function fetchAdminSkills(adminKey: string): Promise<SkillsPayload> {
  const response = await fetch(apiUrl('/api/admin/skills'), {
    headers: adminHeaders(adminKey),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin skills');
  }

  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.skills) || typeof payload.categoryColors !== 'object') {
    throw new Error('Invalid skills payload');
  }

  return {
    skills: payload.skills,
    categoryColors: payload.categoryColors,
  };
}

export async function updateSkill(adminKey: string, skill: SkillNode): Promise<SkillNode> {
  const response = await fetch(apiUrl(`/api/admin/skills/${encodeURIComponent(skill.id)}`), {
    method: 'PUT',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(skill),
  });

  if (!response.ok) {
    throw new Error('Failed to save skill');
  }

  const payload = await response.json();
  if (!payload?.ok || !payload.skill) {
    throw new Error('Invalid save response');
  }

  return payload.skill;
}

export async function deleteSkill(adminKey: string, id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/admin/skills/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  });

  if (!response.ok) {
    throw new Error('Failed to delete skill');
  }
}
