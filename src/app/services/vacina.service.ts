import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  private firestore = inject(Firestore);

  // Histórico de Vacinas
  getVacinas(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'vacinas'), { idField: 'id' });
  }
  addVacina(vacina: any) {
    return addDoc(collection(this.firestore, 'vacinas'), vacina);
  }
  deletarVacina(id: string) {
    return deleteDoc(doc(this.firestore, 'vacinas', id));
  }

  // Novo: Coleção de Usuários (Responsáveis) do Sistema
  getUsuarios(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'usuarios'), { idField: 'id' });
  }
  addUsuario(usuario: any) {
    return addDoc(collection(this.firestore, 'usuarios'), usuario);
  }

  // Novo: Coleção Global de Crianças (Pacientes do SUS)
  getCriancas(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'criancas'), { idField: 'id' });
  }
  addCrianca(crianca: any) {
    return addDoc(collection(this.firestore, 'criancas'), crianca);
  }
  atualizarCrianca(id: string, crianca: any) {
    return updateDoc(doc(this.firestore, 'criancas', id), crianca);
  }
  deletarCrianca(id: string) {
    return deleteDoc(doc(this.firestore, 'criancas', id));
  }
}