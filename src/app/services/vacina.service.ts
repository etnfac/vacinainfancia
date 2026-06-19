import { Injectable, inject } from '@angular/core';
// addDoc
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  private firestore = inject(Firestore);

  constructor() { }

  getVacinas(): Observable<any[]> {
    const vacinasRef = collection(this.firestore, 'vacinas');
    return collectionData(vacinasRef, { idField: 'id' });
  }

  // Google Firestore
  addVacina(vacina: any) {
    const vacinasRef = collection(this.firestore, 'vacinas');
    return addDoc(vacinasRef, vacina);
  }
}