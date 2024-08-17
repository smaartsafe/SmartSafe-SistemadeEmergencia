<template>
  <div class="login-container">
    <h1 class="title">Login de Segurança</h1>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input v-model="email" id="email" type="email" required />
      </div>

      <div class="form-group">
        <label for="password">Senha:</label>
        <input v-model="password" id="password" type="password" required />
      </div>

      <div class="form-group">
        <label for="city">Selecione sua cidade:</label>
        <select v-model="selectedCity" id="city">
          <option value="">Selecione uma cidade</option>
          <option value="Araripe">Araripe</option>
          <option value="Crato">Crato</option>
          <option value="Juazeiro do Norte">Juazeiro do Norte</option>
          <option value="Barbalha">Barbalha</option>
          <option value="Sobral">Sobral</option>
        </select>
      </div>

      <div class="form-group">
        <label for="token">Digite o código para confirmar sua cidade:</label>
        <input
          v-model="cityToken"
          id="token"
          type="text"
          placeholder="Digite o código"
        />
      </div>

      <button type="submit" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        Entrar
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Cookies from "js-cookie";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";

// Importar tokens
import tokensData from "../assets/tokens.json";

const email = ref("");
const password = ref("");
const selectedCity = ref("");
const cityToken = ref("");
const loading = ref(false); // Estado para o carregamento

const tokens = tokensData;
const router = useRouter(); // Instanciar o router

async function handleLogin() {
  if (
    tokens[selectedCity.value] &&
    cityToken.value === tokens[selectedCity.value]
  ) {
    loading.value = true; // Ativar o spinner
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      // Salvar cidade selecionada em cookie
      Cookies.set("selectedCity", selectedCity.value);
      // Redirecionar para a HomeView (corrigido para usar 'home')
      router.push({ name: "home" });
    } catch (error) {
      console.log("Falha no login: " + error.message);
    } finally {
      loading.value = false; // Desativar o spinner
    }
  } else {
    alert(
      "Por favor, verifique se o token é correspondente para a cidade selecionada."
    );
  }
}
</script>

<style scoped>
/* Estilos para o login */
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-top: 50px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="email"],
input[type="password"],
input[type="text"],
select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
  margin-top: 5px;
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: #f9f9f9;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="M7 10l5 5 5-5z" fill="%23666"/%3E%3C/svg%3E');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  position: relative;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3);
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4caf50;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -12px;
  margin-top: -12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
