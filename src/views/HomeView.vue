<template>
  <div style="height: 100vh;">
    <header class="d-flex justify-content-between align-items-center bg-primary text-white p-3 shadow-sm">
      <div class="d-flex align-items-center">
        <img src="/src/assets/FundoSplash.png" alt="Logo" class="logo me-3" />
        <h1 class="h4 mb-0 fw-bold">Sistema de Chamados</h1>
      </div>

      <!-- Ícone de perfil com dropdown -->
      <div class="dropdown">
        <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <span class="material-symbols-rounded">account_circle</span> Perfil
        </button>
        <ul class="dropdown-menu" aria-labelledby="profileDropdown">
          <li><a class="dropdown-item" href="#" @click="handleLogout">Sair</a></li>
        </ul>
      </div>
    </header>

    <main class="container py-4">
      <div v-if="newCallAlert" class="alert alert-danger text-center mb-4 d-flex justify-content-center align-items-center gap-2">
        <span class="material-symbols-rounded">info</span> Um Novo Chamado Foi Feito
      </div>

      <div class="d-flex align-items-center mb-3 justify-content-between">
        <!-- <button v-if="!isSelecting" @click="isSelecting = true" class="btn btn-outline-primary d-flex align-items-center gap-2">
          <span class="material-symbols-rounded">select_all</span> Selecionar Chamados
        </button> -->

        <!-- Opção de excluir temporariamente comentada -->
        <!-- <button v-else @click="deleteSelectedCalls" class="btn btn-danger d-flex align-items-center gap-2">
          <span class="material-symbols-rounded">delete</span> Apagar Selecionadas
        </button> -->
        
        <div class="input-group w-50">
          <span class="input-group-text"><span class="material-symbols-rounded">search</span></span>
          <input v-model="searchQuery" type="text" class="form-control" placeholder="Pesquisar por chamados..." />
        </div>
      </div>

      <div v-for="(group, date) in groupedCalls" :key="date" class="my-4 ">
        <p class="h5 text-uppercase text-muted mb-3">{{ formatDate(date) }}</p>
        <ul class="list-unstyled">
          <li v-for="item in group" :key="item.id" class="card shadow-sm border-light mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">{{ item.nome }}</h5>
                <input v-if="isSelecting" type="checkbox" v-model="selectedCalls" :value="item.id" class="form-check-input" />
              </div>
              <p class="text-muted mb-1"><strong>Data/Horário:</strong> {{ new Date(item.horario).toLocaleString() }}</p>
              <p class="text-muted mb-1"><strong>Endereço:</strong> {{ item.local }}</p>
              <p class="text-muted mb-2"><strong>Coordenadas:</strong> {{ item.latitude }}, {{ item.longitude }}</p>
              <button @click="openGoogleMaps(item.latitude, item.longitude)" class="btn btn-outline-success btn-sm d-flex align-items-center gap-1">
                <span class="material-symbols-rounded">map</span> Ver no mapa
              </button>
              <audio controls :src="item.audio" class="w-100 mt-3">Áudio</audio>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { app } from "../domain/firebase.js";
import {
  collection,
  getFirestore,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useCollection } from "vuefire";
import Cookies from "js-cookie";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router"; // Importando useRouter para redirecionamento

// Função para fazer logout
function handleLogout() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("selectedCity");
      localStorage.removeItem("userEmail");
      const router = useRouter();
      router.push({ name: "login" }); // Redireciona para a página de login
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
    });
}

const db = getFirestore(app);
const callsCollection = collection(db, "calls");

const cityFilter = Cookies.get("selectedCity") || "";

const queryCalls = computed(() => {
  if (cityFilter.value) {
    return query(
      callsCollection,
      where("local", ">=", cityFilter.value),
      where("local", "<=", cityFilter.value + "\uf8ff"),
      orderBy("horario", "desc")
    );
  } else {
    return query(callsCollection, orderBy("horario", "desc"));
  }
});

const datalist = useCollection(queryCalls);

const newCallAlert = ref(false);
const selectedCalls = ref([]);
const isSelecting = ref(false);
const searchQuery = ref("");

function extractCityFromLocal(local) {
  const parts = local.split(", ");
  if (parts.length >= 3) {
    return parts[parts.length - 3];
  }
  return "";
}

const groupedCalls = computed(() => {
  const groups = {};
  const filteredCalls = datalist.value.filter((item) => {
    const city = extractCityFromLocal(item.local).toLowerCase();
    return (
      item.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      (cityFilter === "" || city === cityFilter.toLowerCase())
    );
  });

  filteredCalls.forEach((item) => {
    const callDate = new Date(item.horario).setHours(0, 0, 0, 0);
    if (!groups[callDate]) {
      groups[callDate] = [];
    }
    groups[callDate].push(item);
  });
  return groups;
});

function openGoogleMaps(latitude, longitude) {
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  window.open(googleMapsLink, "_blank");
}

function formatDate(dateString) {
  const date = new Date(parseInt(dateString));
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
    return "Hoje";
  } else if (date.setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) {
    return "Ontem";
  } else {
    return date.toLocaleDateString();
  }
}

onSnapshot(queryCalls.value, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      newCallAlert.value = true;
      setTimeout(() => {
        newCallAlert.value = false;
      }, 2000);
    }
  });
});

async function deleteSelectedCalls() {
  try {
    selectedCalls.value.forEach((callId) => {
      const callRef = doc(db, "calls", callId);
      deleteDoc(callRef);
    });
    selectedCalls.value = [];
    isSelecting.value = false;
  } catch (error) {
    console.error("Error deleting calls:", error);
  }
}
</script>

<style scoped>
.logo {
  width: 50px;
  object-fit: contain;
}

.alert {
  animation: blink 1s linear infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.input-group-text {
  background-color: #f8f9fa;
}

.card-body {
  padding: 1.5rem;
}

.btn-outline-light {
  color: white;
  border: 1px solid white;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Estilos para o dropdown */
.dropdown-menu {
  min-width: 200px;
}

.dropdown-toggle::after {
  display: none; /* Remove o ícone de seta do dropdown */
}
</style>
