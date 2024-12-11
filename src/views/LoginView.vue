<template>
  <div class="d-flex justify-content-center align-items-center vh-100">
    <div class="col-md-6 col-lg-4 login">
      <h1 class="text-center mb-4 d-flex align-items-center gap-1 justify-content-center"> <span class="material-symbols-rounded">login</span> Login de Verificação</h1>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Email:</label>
          <input v-model="email" id="email" type="email" required class="form-control" placeholder="Informe seu email" />
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Senha:</label>
          <input v-model="password" id="password" type="password" required class="form-control" placeholder="Informe sua senha" />
        </div>

        <div class="mb-3">
          <label for="city" class="form-label">Selecione a cidade de atuação:</label>
          <select v-model="selectedCity" id="city" class="form-select">
            <option value="">Selecione uma cidade</option>
            <option value="Araripe">Araripe</option>
            <option value="Crato">Crato</option>
            <option value="Juazeiro do Norte">Juazeiro do Norte</option>
            <option value="Barbalha">Barbalha</option>
            <option value="Sobral">Sobral</option>
            <option value="Fortaleza">Fortaleza</option>
            <option value="Aquiraz">Aquiraz</option>
          </select>
        </div>

        <div class="mb-3">
          <label for="token" class="form-label">Digite o código para confirmar a cidade de atuação:</label>
          <input
            v-model="cityToken"
            id="token"
            type="text"
            placeholder="Digite o código para confirmar a cidade de atuação"
            class="form-control"
          />
        </div>

        <div v-if="error" class="alert alert-danger my-3" role="alert">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2 "></span>
          <span v-else class="material-symbols-rounded">login</span>
          {{ loading ? "Carregando..." : "Entrar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Cookies from "js-cookie";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";
import tokensData from "../assets/tokens.json";

const email = ref("");
const password = ref("");
const selectedCity = ref("");
const cityToken = ref("");
const loading = ref(false);
const error = ref("");

const tokens = tokensData;
const router = useRouter();

async function handleLogin() {
  error.value = "";

  if (
    tokens[selectedCity.value] &&
    cityToken.value === tokens[selectedCity.value]
  ) {
    loading.value = true;
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      Cookies.set("selectedCity", selectedCity.value);

      // Salvar no localStorage para manter o login e a cidade
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("selectedCity", selectedCity.value);
      localStorage.setItem("userEmail", email.value);

      router.push({ name: "home" });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        error.value = "Usuário não encontrado.";
      } else if (err.code === "auth/wrong-password") {
        error.value = "Senha incorreta.";
      } else {
        error.value = "Erro desconhecido.";
      }
    } finally {
      loading.value = false;
    }
  } else {
    error.value = "Por favor, verifique se o token é correspondente para a cidade selecionada.";
  }
}

// Verificar login ao carregar a página
onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const storedCity = localStorage.getItem("selectedCity");

    if (user && isLoggedIn && storedCity) {
      selectedCity.value = storedCity;
      router.push({ name: "home" });
    }
  });
});
</script>

<style scoped>
.login {
  max-width: 400px;
}
</style>
