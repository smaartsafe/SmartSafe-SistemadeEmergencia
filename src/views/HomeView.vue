<script setup>
import { ref, computed } from "vue";
import app from "@/domain/firebase";
import {
  collection,
  getFirestore,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useCollection } from "vuefire";
import "@mdi/font/css/materialdesignicons.min.css";

const db = getFirestore(app);
const callsCollection = collection(db, "calls");
const queryCalls = query(callsCollection, orderBy("horario", "desc"));
const datalist = useCollection(queryCalls);

const newCallAlert = ref(false);
const selectedCalls = ref([]);
const isSelecting = ref(false);
const searchQuery = ref(""); // Nova variável para armazenar a pesquisa

// Agrupar chamadas por data
const groupedCalls = computed(() => {
  const groups = {};
  const filteredCalls = datalist.value.filter((item) => 
    item.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) // Filtrar chamadas pelo nome
  );

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

onSnapshot(callsCollection, (snapshot) => {
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

<template>
  <div class="header">
    <img src="/src/assets/FundoSplash.png" alt="" style="width: 80px" />
    <h1 class="title">Lista de Chamadas</h1>
    <!-- Barra de Pesquisa -->
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Pesquisar por nome..."
      class="search-bar"
    />
  </div>
  <main class="main">
    <div v-if="newCallAlert" class="alert"></div>
    <div class="options">
      <button
        v-if="!isSelecting"
        @click="isSelecting = true"
        class="select-button"
      >
        Selecionar Chamadas
      </button>
      <button v-else @click="deleteSelectedCalls" class="delete-button">
        <i class="mdi mdi-trash-can trash-icon"></i> Apagar Chamadas
        Selecionadas
      </button>
    </div>

    <div v-for="(group, date) in groupedCalls" :key="date">
      <h2>{{ formatDate(date) }}</h2>
      <ul class="calls">
        <li v-for="item in group" :key="item.id" class="call-item">
          <div class="call-info">
            <input
              v-if="isSelecting"
              type="checkbox"
              v-model="selectedCalls"
              :value="item.id"
              class="call-checkbox"
            />
            <p class="info"><span class="label">Nome:</span> {{ item.nome }}</p>
            <p class="info">
              <span class="label">Data/Horário:</span>
              {{ new Date(item.horario).toLocaleString() }}
            </p>
            <p class="info">
              <span class="label">Endereço:</span> {{ item.local }}
            </p>
            <p class="info">
              <span class="label">Coordenadas:</span> {{ item.latitude }},
              {{ item.longitude }}
            </p>
            <button
              @click="openGoogleMaps(item.latitude, item.longitude)"
              class="map-button"
            >
              <i class="mdi mdi-magnify"></i> Ver localização no mapa
            </button>

            <audio controls :src="item.audio" class="audio">Áudio</audio>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>


<style scoped>
.header {
  background-color: #9344fa;
  color: #fff;
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.title {
  font-size: 30px;
  font-weight: bolder;
  margin: 0;
}

.search-bar {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
}

.main {
  font-family: Arial, sans-serif;
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  font-weight: bolder;
  text-transform: uppercase;
}
.calls {
  list-style: none;
  padding: 0;
  margin-bottom: 40px;
}

.call-item {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.map-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  align-items: center;
  display: flex;
}

.map-button:hover {
  background-color: #388e3c;
}
.call-info {
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  color: "#fff";
  font-size: 18px;
}

.info {
  margin: 0;
  display: flex;
  font-size: 16px;
  flex-direction: column;
  margin-bottom: 7px;
}

.audio {
  margin-top: 10px;
  display: block;
  width: 100%;
  border-radius: 5px;
}

.alert {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 0, 0, 0.6);
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

.options {
  margin-bottom: 20px;
}

.select-button,
.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 10px;
  border-radius: 5px;
  cursor: pointer;
  align-items: center;
  display: flex;
  gap: 7px;
  font-size: 16px;
}

.select-button:hover,
.delete-button:hover {
  background-color: #d32f2f;
}

.call-checkbox {
  margin-right: 10px;
}

.trash-icon,
.mdi-magnify {
  font-size: 24px; /* Altere o tamanho conforme necessário */
}

@media only screen and (max-width: 768px) {
  .header {
    padding: 15px 0;
  }
  .title {
    font-size: 24px;
  }
  .main {
    width: 95%;
  }
  .select-button,
  .delete-button {
    font-size: 14px;
  }
  .info {
    flex-direction: column;
  }
}
</style>
