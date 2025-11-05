type UnauthorizedListener = () => void;

class AuthEvents {
  private listeners: UnauthorizedListener[] = [];

  subscribe(listener: UnauthorizedListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emitUnauthorized(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = new AuthEvents();
