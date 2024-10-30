import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia(); // Cria a instância do Pinia

app.use(pinia); // Usa o Pinia
app.use(router); // Usa o router

app.mount('#app'); // Monta a aplicação
