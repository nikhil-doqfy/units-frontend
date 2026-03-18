import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private http = inject(HttpClient);
  private sharedService = inject(SharedService);
  private SERVER_ADDRESS = environment.SERVER_ADDRESS;

  constructor() {}

  // ── Properties (parent) ──────────────────────────────────────────────────
  getProperties(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property${queryString}`);
  }

  exportProperties(params: Record<string, any> = {}): void {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    this.http.get(`${this.SERVER_ADDRESS}/property${queryString}`, { responseType: 'blob' }).subscribe((blob) => {
      this.sharedService.downloadBlob(blob, 'properties.csv');
    });
  }

  addProperty(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/property`, data);
  }

  editProperty(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/property`, data);
  }

  // ── Property Units ────────────────────────────────────────────────────────
  getPropertyUnits(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/details${queryString}`);
  }

  getPropertyUnit(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/save/property${queryString}`);
  }

  addPropertyUnit(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/save/property`, data);
  }

  editPropertyUnit(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/save/property`, data);
  }

  // ── Property Blocks ───────────────────────────────────────────────────────
  getPropertyBlocks(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/blocks${queryString}`);
  }

  addPropertyBlocks(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/property/blocks`, data);
  }

  editPropertyBlocks(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/property/blocks`, data);
  }

  // ── Images ────────────────────────────────────────────────────────────────
  getPropertyImages(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/images${queryString}`);
  }

  addPropertyImages(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/images`, data);
  }

  editPropertyImages(data: Record<string, any>) {
    return this.http.put(`${this.SERVER_ADDRESS}/property/images`, data);
  }

  deletePropertyImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/property/images?image_id=${imageId}`);
  }

  // ── Documents ─────────────────────────────────────────────────────────────
  getPropertyDocumentTypes(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/property/document-types`);
  }

  getPropertyDocuments(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/documents${queryString}`);
  }

  addPropertyDocuments(data: Record<string, any>) {
    return this.http.post(`${this.SERVER_ADDRESS}/property/documents`, data);
  }

  editPropertyDocuments(data: Record<string, any>) {
    return this.http.put(`${this.SERVER_ADDRESS}/property/documents`, data);
  }

  deletePropertyDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/property/documents?document_id=${documentId}`);
  }

  // ── Misc ──────────────────────────────────────────────────────────────────
  getExcelFileOfProperty(_data: Record<string, any>) {
    return this.http.get(`${this.SERVER_ADDRESS}/export/property`, {
      responseType: 'blob',
    });
  }

  getParentPropertyData(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/parent/property${queryString}`);
  }

  getPropertyDetailsForLease(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property_owner_compny_lease${queryString}`);
  }

  // ── Units ─────────────────────────────────────────────────────────────────
  getUnits(params: Record<string, any> = {}): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/unit${queryString}`);
  }

  exportUnits(params: Record<string, any> = {}): void {
    const queryString = this.sharedService.getQueryString({ ...params, export: 'csv' });
    this.http.get(`${this.SERVER_ADDRESS}/property/unit${queryString}`, { responseType: 'blob' }).subscribe((blob) => {
      this.sharedService.downloadBlob(blob, 'units.csv');
    });
  }

  addUnit(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/property/unit`, data);
  }

  editUnit(data: Record<string, any>): Observable<any> {
    return this.http.put(`${this.SERVER_ADDRESS}/property/unit`, data);
  }

  // ── Unit Images ───────────────────────────────────────────────────────────
  getUnitImages(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/unit/images${queryString}`);
  }

  addUnitImages(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/property/unit/images`, data);
  }

  deleteUnitImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/property/unit/images?image_id=${imageId}`);
  }

  // ── Unit Documents ────────────────────────────────────────────────────────
  getUnitDocumentTypes(): Observable<any> {
    return this.http.get(`${this.SERVER_ADDRESS}/property/unit/document-types`);
  }

  getUnitDocuments(params: Record<string, any>): Observable<any> {
    const queryString = this.sharedService.getQueryString(params);
    return this.http.get(`${this.SERVER_ADDRESS}/property/unit/documents${queryString}`);
  }

  addUnitDocuments(data: Record<string, any>): Observable<any> {
    return this.http.post(`${this.SERVER_ADDRESS}/property/unit/documents`, data);
  }

  deleteUnitDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.SERVER_ADDRESS}/property/unit/documents?document_id=${documentId}`);
  }
}
