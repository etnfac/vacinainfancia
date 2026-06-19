import { Injectable, inject } from '@angular/core';
// doc e deleteDoc
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc } from '@angular/fire/firestore';
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

  addVacina(vacina: any) {
    const vacinasRef = collection(this.firestore, 'vacinas');
    return addDoc(vacinasRef, vacina);
  }

  // ID único da vacina
  deletarVacina(id: string) {
    const vacinaDocRef = doc(this.firestore, `vacinas/${id}`);
    return deleteDoc(vacinaDocRef);
  }
}