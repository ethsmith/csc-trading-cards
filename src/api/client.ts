import type { OwnedCard, TradeOffer } from '../types/api';
import type { PlayerWithStats, CardRarity } from '../types/player';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  getLoginUrl(): string {
    return `${API_BASE_URL}/auth/discord`;
  }

  async getMe(): Promise<{
    discordId: string;
    username: string;
    avatar: string | null;
    avatarUrl: string | null;
  }> {
    return this.request('/auth/me');
  }

  async getPlayers(): Promise<{ players: PlayerWithStats[] }> {
    return this.request('/players');
  }

  async getCollection(): Promise<{ cards: OwnedCard[] }> {
    return this.request('/collection');
  }

  async getCollectionStats(): Promise<{
    total: number;
    uniqueSnapshots: number;
    byRarity: Record<string, number>;
  }> {
    return this.request('/collection/stats');
  }

  async getPackBalance(): Promise<{ packBalance: number }> {
    return this.request('/packs/balance');
  }

  async openPack(packSize: number = 5): Promise<{
    cards: OwnedCard[];
    newSnapshots: number;
    packBalance: number;
    message: string;
  }> {
    return this.request('/packs/open', {
      method: 'POST',
      body: JSON.stringify({ packSize }),
    });
  }

  async redeemCode(code: string): Promise<{
    message: string;
    packsAdded: number;
    packBalance: number;
  }> {
    return this.request('/codes/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getCodeInfo(code: string): Promise<{
    code: string;
    packCount: number;
    cardsPerPack: number;
    guaranteedRarities: Record<CardRarity, number> | null;
    isRedeemed: boolean;
    isExpired: boolean;
    expiresAt: string | null;
  }> {
    return this.request(`/codes/${code}`);
  }

  async searchUsers(query: string): Promise<{ users: Array<{ discordId: string; username: string; avatarUrl: string | null }> }> {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getUserProfile(discordId: string): Promise<{ discordId: string; username: string; avatar: string | null }> {
    return this.request(`/users/${discordId}`);
  }

  async getUserCollection(discordId: string): Promise<{ cards: OwnedCard[]; isOwnCollection: boolean }> {
    return this.request(`/collection/user/${discordId}`);
  }

  async getTrades(type: 'incoming' | 'outgoing' | 'all' = 'all'): Promise<{ trades: TradeOffer[] }> {
    return this.request(`/trades?type=${type}`);
  }

  async getPendingTrades(): Promise<{ trades: TradeOffer[] }> {
    return this.request('/trades/pending');
  }

  async createTrade(
    toUserId: string,
    offeredCardIds: string[],
    requestedCardIds: string[]
  ): Promise<{ trade: TradeOffer }> {
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify({ toUserId, offeredCardIds, requestedCardIds }),
    });
  }

  async acceptTrade(tradeId: string): Promise<{ message: string }> {
    return this.request(`/trades/${tradeId}/accept`, { method: 'POST' });
  }

  async rejectTrade(tradeId: string): Promise<{ message: string }> {
    return this.request(`/trades/${tradeId}/reject`, { method: 'POST' });
  }

  async cancelTrade(tradeId: string): Promise<{ message: string }> {
    return this.request(`/trades/${tradeId}/cancel`, { method: 'POST' });
  }

  async generatePackCode(options: {
    packCount?: number;
    cardsPerPack?: number;
    guaranteedRarities?: Record<string, number>;
    expiresInDays?: number;
  } = {}): Promise<{ code: string; packCount: number }> {
    return this.request('/codes/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async getPendingGifts(): Promise<{
    gifts: Array<{
      id: string;
      name: string;
      packCount: number;
      expiresAt: string | null;
      createdAt: string;
    }>;
    totalPacks: number;
  }> {
    return this.request('/gifts/pending');
  }

  async claimGift(giftId: string): Promise<{
    message: string;
    packsClaimed: number;
    newPackBalance: number;
  }> {
    return this.request(`/gifts/claim/${giftId}`, { method: 'POST' });
  }

  async claimAllGifts(): Promise<{
    message: string;
    giftsClaimed: number;
    totalPacks: number;
    newPackBalance: number;
  }> {
    return this.request('/gifts/claim-all', { method: 'POST' });
  }

  // Changelog endpoints
  async getChangelogs(): Promise<{
    changelogs: Array<{
      id: string;
      version: string | null;
      title: string;
      content: string;
      createdAt: string;
      isRead: boolean;
      readAt: string | null;
    }>;
    unreadCount: number;
  }> {
    return this.request('/changelogs');
  }

  async getUnreadChangelogsCount(): Promise<{ unreadCount: number }> {
    return this.request('/changelogs/unread-count');
  }

  async markChangelogRead(changelogId: string): Promise<{ message: string; markedAsRead: boolean }> {
    return this.request(`/changelogs/${changelogId}/read`, { method: 'POST' });
  }

  async markAllChangelogsRead(): Promise<{ message: string; markedCount: number }> {
    return this.request('/changelogs/read-all', { method: 'POST' });
  }

  // Duplicate cards trade-in endpoint
  async tradeDuplicates(cardIds: string[]): Promise<{
    message: string;
    packBalance: number;
  }> {
    return this.request('/packs/trade-in', {
      method: 'POST',
      body: JSON.stringify({ cardIds }),
    });
  }

  // Search for users who own cards matching player name and optional rarity
  async searchCardOwners(playerName: string, rarity?: string): Promise<{
    owners: Array<{
      discordUserId: string;
      username: string;
      avatar: string | null;
      cardCount: number;
    }>;
    totalOwners: number;
  }> {
    const params = new URLSearchParams({ playerName });
    if (rarity && rarity !== 'all') {
      params.append('rarity', rarity);
    }
    return this.request(`/collection/search?${params.toString()}`);
  }

  // Trade history endpoint
  async getTradeHistory(options?: {
    type?: 'incoming' | 'outgoing';
    status?: 'accepted' | 'rejected' | 'cancelled';
  }): Promise<{ trades: TradeOffer[] }> {
    const params = new URLSearchParams();
    if (options?.type) {
      params.append('type', options.type);
    }
    if (options?.status) {
      params.append('status', options.status);
    }
    const queryString = params.toString();
    return this.request(`/trades/history${queryString ? `?${queryString}` : ''}`);
  }
}

export const api = new ApiClient();
