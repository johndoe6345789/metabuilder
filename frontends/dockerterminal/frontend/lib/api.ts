import { getAuthToken } from '@metabuilder/dbal-sso/core';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  uptime: string;
}

export interface ContainersResponse {
  containers: Container[];
}

class ApiClient {
  async getContainers(): Promise<Container[]> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/containers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired');
      }
      throw new Error('Failed to fetch containers');
    }

    const data: ContainersResponse = await response.json();
    return data.containers;
  }

  async executeCommand(containerId: string, command: string): Promise<any> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/containers/${containerId}/exec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute command');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
