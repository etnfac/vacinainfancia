import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';

// Configuração do banco de dados
const firebaseConfig = {
  apiKey: "AIzaSyB5vvK4WDnJIT-TqfvS7x9Ee4rkmshRYkU",
  authDomain: "vacinainfancia.firebaseapp.com",
  projectId: "vacinainfancia",
  storageBucket: "vacinainfancia.firebasestorage.app",
  messagingSenderId: "206431395209",
  appId: "1:206431395209:web:1b16140aa935640d6dd558"
};

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Ativando o Firebase, Firestore e Auth
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ],
}).catch(err => console.error(err));