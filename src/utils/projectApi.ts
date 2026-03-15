import type { Project } from '../components/3d/HolographicGallery';
import { apiUrl } from './api';

export async function fetchProjects(category?: string): Promise<Project[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(apiUrl(`/api/projects${query}`));

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.projects)) {
    throw new Error('Invalid project payload');
  }

  return payload.projects;
}

function adminHeaders(adminKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
  };
}

export async function fetchAdminProjects(adminKey: string, category?: string): Promise<Project[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(apiUrl(`/api/admin/projects${query}`), {
    headers: adminHeaders(adminKey),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin projects');
  }

  const payload = await response.json();
  if (!payload?.ok || !Array.isArray(payload.projects)) {
    throw new Error('Invalid project payload');
  }

  return payload.projects;
}

export async function updateProject(adminKey: string, project: Project): Promise<Project> {
  const response = await fetch(apiUrl(`/api/admin/projects/${encodeURIComponent(project.id)}`), {
    method: 'PUT',
    headers: adminHeaders(adminKey),
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    throw new Error('Failed to save project');
  }

  const payload = await response.json();
  if (!payload?.ok || !payload.project) {
    throw new Error('Invalid save response');
  }

  return payload.project;
}

export async function deleteProject(adminKey: string, id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/admin/projects/${encodeURIComponent(id)}`), {
    method: 'DELETE',
    headers: adminHeaders(adminKey),
  });

  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
}
