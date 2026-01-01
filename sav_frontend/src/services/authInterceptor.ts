class AuthInterceptor {
  private refreshing = false;
  private refreshQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    originalRequest: () => Promise<Response>;
  }> = [];

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    const headers = {
      ...((options.headers as Record<string, string>) || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const response = await fetch(url, { ...options, headers, credentials: 'include' });

      // Si token expiré, essayer de le rafraîchir
      if (response.status === 401 && token && !this.refreshing) {
        return await this.handleUnauthorized(url, options);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  private async handleUnauthorized(url: string, options: RequestInit): Promise<Response> {
    if (this.refreshing) {
      // Attendre que le rafraîchissement soit terminé
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({
          resolve,
          reject,
          originalRequest: () => this.fetchWithAuth(url, options),
        });
      });
    }

    this.refreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token manquant');
      }

      const refreshResponse = await fetch((import.meta.env.VITE_API_GATEWAY || 'https://localhost:7076/apigateway') + '/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.token);

        // Réessayer la requête originale avec le nouveau token
        const retryResponse = await this.fetchWithAuth(url, options);

        // Traiter les requêtes en attente
        this.processRefreshQueue();

        return retryResponse;
      } else {
        this.clearAuth();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    } catch (error) {
      this.clearAuth();
      throw error;
    } finally {
      this.refreshing = false;
    }
  }

  private processRefreshQueue() {
    this.refreshQueue.forEach(async ({ resolve, originalRequest }) => {
      try {
        const response = await originalRequest();
        resolve(response);
      } catch (error) {
        // ignore
      }
    });
    this.refreshQueue = [];
  }

  private clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}

export const authInterceptor = new AuthInterceptor();
