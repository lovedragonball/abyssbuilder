// Local Storage implementation (replaces Firebase Firestore)
import type { Build } from './types';

const BUILDS_KEY = 'builds';

export async function getAllBuilds(visibility?: 'public' | 'private'): Promise<Build[]> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  if (visibility) {
    return builds.filter((b: Build) => b.visibility === visibility);
  }
  return builds;
}

export async function getBuild(id: string): Promise<Build | null> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  return builds.find((b: Build) => b.id === id) || null;
}

export async function deleteBuild(id: string): Promise<void> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  const filtered = builds.filter((b: Build) => b.id !== id);
  localStorage.setItem(BUILDS_KEY, JSON.stringify(filtered));
}

export async function voteBuild(buildId: string, userId: string, vote: boolean): Promise<void> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
  
  if (buildIndex !== -1) {
    const build = builds[buildIndex];
    const votedBy = build.votedBy || [];
    
    if (vote) {
      // Add vote
      if (!votedBy.includes(userId)) {
        build.votedBy = [...votedBy, userId];
        build.voteCount = (build.voteCount || 0) + 1;
      }
    } else {
      // Remove vote
      build.votedBy = votedBy.filter((id: string) => id !== userId);
      build.voteCount = Math.max(0, (build.voteCount || 0) - 1);
    }
    
    builds[buildIndex] = build;
    localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
  }
}

export async function incrementBuildViews(buildId: string): Promise<void> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
  
  if (buildIndex !== -1) {
    builds[buildIndex].views = (builds[buildIndex].views || 0) + 1;
    localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
  }
}

export async function createBuild(buildData: Omit<Build, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  const newBuild: Build = {
    ...buildData,
    id: `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Build;
  
  builds.push(newBuild);
  localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
  return newBuild.id;
}

export async function updateBuild(buildId: string, buildData: Partial<Build>): Promise<void> {
  const builds = JSON.parse(localStorage.getItem(BUILDS_KEY) || '[]');
  const buildIndex = builds.findIndex((b: Build) => b.id === buildId);
  
  if (buildIndex !== -1) {
    builds[buildIndex] = {
      ...builds[buildIndex],
      ...buildData,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(BUILDS_KEY, JSON.stringify(builds));
  }
}
