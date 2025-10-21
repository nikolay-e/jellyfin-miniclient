/**
 * Library Items Module
 * Handles queries for music library items (albums, artists, tracks)
 */

import { JellyfinClient } from './client.js';
import {
  ItemsQuery,
  ItemsResult,
  AudioItem,
  MusicAlbum,
  MusicArtist,
  AuthenticationError
} from '../models/types.js';

export class ItemsService {
  constructor(private client: JellyfinClient) {}

  /**
   * Query items from library
   * Generic method for all item types
   */
  async queryItems<T = any>(query: ItemsQuery): Promise<ItemsResult<T>> {
    const userId = this.client.getUserId();
    if (!userId) {
      throw new AuthenticationError('Not authenticated');
    }

    // Build query parameters
    const params: Record<string, any> = {};

    if (query.ParentId) params.ParentId = query.ParentId;
    if (query.IncludeItemTypes) params.IncludeItemTypes = query.IncludeItemTypes;
    if (query.Recursive !== undefined) params.Recursive = query.Recursive;
    if (query.SortBy) params.SortBy = query.SortBy;
    if (query.SortOrder) params.SortOrder = query.SortOrder;
    if (query.StartIndex !== undefined) params.StartIndex = query.StartIndex;
    if (query.Limit !== undefined) params.Limit = query.Limit;
    if (query.SearchTerm) params.SearchTerm = query.SearchTerm;
    if (query.ArtistIds) params.ArtistIds = query.ArtistIds.join(',');
    if (query.AlbumIds) params.AlbumIds = query.AlbumIds.join(',');
    if (query.GenreIds) params.GenreIds = query.GenreIds.join(',');

    // Fields to include in response
    if (query.Fields && query.Fields.length > 0) {
      params.Fields = query.Fields.join(',');
    }

    return this.client.get<ItemsResult<T>>(`/Users/${userId}/Items`, params);
  }

  /**
   * Get music albums
   */
  async getAlbums(options?: {
    parentId?: string;
    artistId?: string;
    genreId?: string;
    sortBy?: string;
    startIndex?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<ItemsResult<MusicAlbum>> {
    const query: ItemsQuery = {
      IncludeItemTypes: 'MusicAlbum',
      Recursive: true,
      Fields: ['PrimaryImageAspectRatio', 'Genres', 'DateCreated', 'Artists'],
      SortBy: options?.sortBy || 'SortName',
      SortOrder: 'Ascending',
      StartIndex: options?.startIndex,
      Limit: options?.limit,
      SearchTerm: options?.searchTerm
    };

    if (options?.parentId) {
      query.ParentId = options.parentId;
    }

    if (options?.artistId) {
      query.ArtistIds = [options.artistId];
    }

    if (options?.genreId) {
      query.GenreIds = [options.genreId];
    }

    return this.queryItems<MusicAlbum>(query);
  }

  /**
   * Get music artists
   */
  async getArtists(options?: {
    startIndex?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<ItemsResult<MusicArtist>> {
    const query: ItemsQuery = {
      IncludeItemTypes: 'MusicArtist',
      Recursive: true,
      Fields: ['PrimaryImageAspectRatio', 'Genres'],
      SortBy: 'SortName',
      SortOrder: 'Ascending',
      StartIndex: options?.startIndex,
      Limit: options?.limit,
      SearchTerm: options?.searchTerm
    };

    return this.queryItems<MusicArtist>(query);
  }

  /**
   * Get audio tracks
   */
  async getTracks(options?: {
    parentId?: string;
    albumId?: string;
    artistId?: string;
    sortBy?: string;
    startIndex?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<ItemsResult<AudioItem>> {
    const query: ItemsQuery = {
      IncludeItemTypes: 'Audio',
      Recursive: true,
      Fields: [
        'MediaSources',
        'Artists',
        'Album',
        'AlbumId',
        'AlbumPrimaryImageTag',
        'Genres',
        'DateCreated'
      ],
      SortBy: options?.sortBy || 'ParentIndexNumber,IndexNumber,SortName',
      SortOrder: 'Ascending',
      StartIndex: options?.startIndex,
      Limit: options?.limit,
      SearchTerm: options?.searchTerm
    };

    if (options?.parentId) {
      query.ParentId = options.parentId;
    }

    if (options?.albumId) {
      query.AlbumIds = [options.albumId];
    }

    if (options?.artistId) {
      query.ArtistIds = [options.artistId];
    }

    return this.queryItems<AudioItem>(query);
  }

  /**
   * Get single item by ID
   */
  async getItem(itemId: string): Promise<AudioItem | MusicAlbum | MusicArtist> {
    const userId = this.client.getUserId();
    if (!userId) {
      throw new AuthenticationError('Not authenticated');
    }

    return this.client.get(`/Users/${userId}/Items/${itemId}`);
  }

  /**
   * Get tracks from an album
   */
  async getAlbumTracks(albumId: string): Promise<AudioItem[]> {
    const result = await this.getTracks({ albumId });
    return result.Items;
  }

  /**
   * Get albums from an artist
   */
  async getArtistAlbums(artistId: string): Promise<MusicAlbum[]> {
    const result = await this.getAlbums({ artistId });
    return result.Items;
  }

  /**
   * Search across all music items
   */
  async search(searchTerm: string, options?: {
    limit?: number;
  }): Promise<{
    albums: MusicAlbum[];
    artists: MusicArtist[];
    tracks: AudioItem[];
  }> {
    const limit = options?.limit || 20;

    const [albums, artists, tracks] = await Promise.all([
      this.getAlbums({ searchTerm, limit }),
      this.getArtists({ searchTerm, limit }),
      this.getTracks({ searchTerm, limit })
    ]);

    return {
      albums: albums.Items,
      artists: artists.Items,
      tracks: tracks.Items
    };
  }

  /**
   * Get recently added albums
   */
  async getRecentAlbums(limit: number = 20): Promise<MusicAlbum[]> {
    const result = await this.getAlbums({
      sortBy: 'DateCreated',
      limit
    });
    return result.Items;
  }

  /**
   * Get stream URL for audio item
   */
  getStreamUrl(itemId: string): string {
    return this.client.getStreamUrl(itemId);
  }

  /**
   * Get image URL for item
   */
  getImageUrl(
    itemId: string,
    imageType: string = 'Primary',
    options?: {
      tag?: string;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): string {
    return this.client.getImageUrl(itemId, imageType, options);
  }
}
