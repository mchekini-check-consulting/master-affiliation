import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type FileFamily = 'PDF' | 'WORD' | 'EXCEL' | 'IMAGE';

export interface DocTheme {
  id: number;
  name: string;
  document_count: number;
}

export interface DocItem {
  id: number;
  title: string;
  description: string | null;
  tags: string[];
  theme_id: number;
  theme_name: string;
  file_type: FileFamily;
  mime_type: string;
  original_filename: string;
  size_bytes: number;
  published_date: string;
  deleted_date: string | null;
}

export interface DocSearch {
  q: string;
  themeIds: number[];
  types: FileFamily[];
  from: string;
  to: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);

  themes(): Promise<DocTheme[]> {
    return firstValueFrom(this.http.get<DocTheme[]>('/api/themes'));
  }

  search(criteres: DocSearch): Promise<DocItem[]> {
    let params = new HttpParams();
    if (criteres.q.trim()) params = params.set('q', criteres.q.trim());
    for (const id of criteres.themeIds) params = params.append('themeIds', id);
    for (const t of criteres.types) params = params.append('types', t);
    if (criteres.from) params = params.set('from', criteres.from);
    if (criteres.to) params = params.set('to', criteres.to);
    return firstValueFrom(this.http.get<DocItem[]>('/api/documents', { params }));
  }

  fileUrl(id: number): string {
    return `/api/documents/${id}/file`;
  }

  downloadUrl(id: number): string {
    return `/api/documents/${id}/download`;
  }

  // ------------------------------------------------------------------
  // Administration (403 côté API pour un rôle standard)
  // ------------------------------------------------------------------

  upload(file: File, title: string, themeId: number, description: string, tags: string): Promise<DocItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    form.append('themeId', String(themeId));
    if (description) form.append('description', description);
    if (tags) form.append('tags', tags);
    return firstValueFrom(this.http.post<DocItem>('/api/admin/documents', form));
  }

  update(id: number, meta: { title?: string; description?: string; tags?: string; themeId?: number }): Promise<DocItem> {
    return firstValueFrom(this.http.patch<DocItem>(`/api/admin/documents/${id}`, meta));
  }

  replaceFile(id: number, file: File): Promise<DocItem> {
    const form = new FormData();
    form.append('file', file);
    return firstValueFrom(this.http.put<DocItem>(`/api/admin/documents/${id}/file`, form));
  }

  softDelete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/admin/documents/${id}`));
  }

  trash(): Promise<DocItem[]> {
    return firstValueFrom(this.http.get<DocItem[]>('/api/admin/documents/trash'));
  }

  restore(id: number): Promise<DocItem> {
    return firstValueFrom(this.http.post<DocItem>(`/api/admin/documents/${id}/restore`, {}));
  }

  createTheme(name: string): Promise<DocTheme> {
    return firstValueFrom(this.http.post<DocTheme>('/api/admin/themes', { name }));
  }

  renameTheme(id: number, name: string): Promise<DocTheme> {
    return firstValueFrom(this.http.patch<DocTheme>(`/api/admin/themes/${id}`, { name }));
  }

  deleteTheme(id: number, reassignTo?: number): Promise<void> {
    let params = new HttpParams();
    if (reassignTo != null) params = params.set('reassignTo', reassignTo);
    return firstValueFrom(this.http.delete<void>(`/api/admin/themes/${id}`, { params }));
  }
}
