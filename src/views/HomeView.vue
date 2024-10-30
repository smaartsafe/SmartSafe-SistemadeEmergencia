<template>
  <div style="height: 100dvh;">
    <header class="d-flex justify-content-center align-items-center bg-primary text-white py-3 rounded mb-4">
      <img src="/src/assets/FundoSplash.png" alt="Logo" class="logo me-3" />
      <h1 class="h4 mb-0 fw-bold">Lista de Chamados</h1>
    </header>

    <main class="container">
      <div v-if="newCallAlert" class="alert alert-danger justify-content-center text-center mb-4 d-flex align-items-center gap-1 "> <span class="material-symbols-rounded">info</span> Um Novo Chamado Foi Feito</div>

      <div class="d-flex align-items-center mb-3">
        <button v-if="!isSelecting" @click="isSelecting = true" class="btn btn-outline-primary me-3">
          Selecionar Chamadas
        </button>
        <button v-else @click="deleteSelectedCalls" class="btn btn-danger me-3 d-flex align-items-center gap-1">
          <span class="material-symbols-rounded">
            delete
          </span>Apagar Selecionadas
        </button>
        <div class="input-group w-50">
          <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
          <input v-model="searchQuery" type="text" placeholder="Pesquisar por nome..." class="form-control" />
        </div>
      </div>

      <div v-for="(group, date) in groupedCalls" :key="date" class="mb-3">
        <h2 class="h6 text-uppercase text-muted mb-2">{{ formatDate(date) }}</h2>
        <ul class="list-unstyled">
          <li v-for="item in group" :key="item.id" class="card mb-3 shadow-sm border-light">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="mb-0">{{ item.nome }}</h5>
                <input v-if="isSelecting" type="checkbox" v-model="selectedCalls" :value="item.id"
                  class="form-check-input" />
              </div>
              <p class="text-muted mb-1"><strong>Data/Horário:</strong> {{ new Date(item.horario).toLocaleString() }}
              </p>
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
import "@mdi/font/css/materialdesignicons.min.css";

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
}

.alert {
  animation: blink 1s linear infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
