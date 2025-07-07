<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p class="text-gray-600 mt-1">Gestion complète de votre plateforme e-commerce</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Accès administrateur
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Navigation rapide -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <router-link 
          to="/stock-dashboard" 
          class="group p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Dashboard Stock</h3>
              <p class="text-sm text-gray-600">Gestion des stocks</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/dashboard-analytics" 
          class="group p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Analytics</h3>
              <p class="text-sm text-gray-600">Statistiques & rapports</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/compta-dashboard" 
          class="group p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Comptabilité</h3>
              <p class="text-sm text-gray-600">Dashboard comptable</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/promotions" 
          class="group p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Promotions</h3>
              <p class="text-sm text-gray-600">Codes promo & offres</p>
            </div>
          </div>
        </router-link>

        <router-link 
          to="/newsletter-manager" 
          class="group p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Newsletter</h3>
              <p class="text-sm text-gray-600">Campagnes email</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Section Utilisateurs -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 mb-8">
        <div class="p-6 border-b border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
              <p class="text-gray-600 text-sm mt-1">{{ users.length }} utilisateur(s) au total</p>
            </div>
            <button 
              @click="showAddUserForm = !showAddUserForm"
              class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        </div>

        <!-- Formulaire d'ajout d'utilisateur -->
        <div v-if="showAddUserForm" class="p-6 bg-blue-50/50 border-b border-gray-200/50">
          <form @submit.prevent="addUser" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              v-model="newUser.firstName" 
              placeholder="Prénom" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <input 
              v-model="newUser.lastName" 
              placeholder="Nom de famille" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <input 
              v-model="newUser.email" 
              placeholder="Email" 
              type="email"
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <input 
              v-model="newUser.password" 
              type="password" 
              placeholder="Mot de passe" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <input 
              v-model="newUser.shippingAddress" 
              placeholder="Adresse de livraison" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
            <select 
              v-model="newUser.role" 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ROLE_USER">Utilisateur</option>
              <option value="ROLE_STORE_KEEPER">Store Keeper</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_COMPTA">Comptable</option>
            </select>
            <div class="flex space-x-3">
              <button 
                type="submit" 
                class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Créer</span>
              </button>
              <button 
                type="button"
                @click="showAddUserForm = false"
                class="px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Formulaire de modification d'utilisateur -->
        <div v-if="editUserForm" class="p-6 bg-green-50/50 border-b border-gray-200/50">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Modifier l'utilisateur</h3>
          <form @submit.prevent="updateUser(editUserForm.userId)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              v-model="editUserForm.firstName" 
              placeholder="Prénom" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <input 
              v-model="editUserForm.lastName" 
              placeholder="Nom de famille" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <input 
              v-model="editUserForm.email" 
              placeholder="Email" 
              type="email"
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <input 
              v-model="editUserForm.password" 
              type="password" 
              placeholder="Nouveau mot de passe (optionnel)" 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <input 
              v-model="editUserForm.shippingAddress" 
              placeholder="Adresse de livraison" 
              required 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
            <select 
              v-model="editUserForm.role" 
              class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="ROLE_USER">Utilisateur</option>
              <option value="ROLE_STORE_KEEPER">Store Keeper</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_COMPTA">Comptable</option>
            </select>
            <div class="flex space-x-3">
              <button 
                type="submit" 
                class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Modifier</span>
              </button>
              <button 
                type="button"
                @click="editUserForm = null"
                class="px-4 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des utilisateurs -->
        <div class="p-6">
          <div class="space-y-3">
            <div 
              v-for="user in paginatedUsers" 
              :key="user.userId" 
              class="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</p>
                  <p class="text-sm text-gray-600">{{ user.email }}</p>
                  <span class="inline-block px-2 py-1 text-xs rounded-full" :class="getRoleClass(user.role)">
                    {{ getRoleText(user.role) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <button 
                  @click="editUser(user)" 
                  class="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  Modifier
                </button>
                <confirm-button
                  :delete-url="`/users/${user.userId}`"
                  :on-success="loadUsers"
                  class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Pagination utilisateurs -->
          <div v-if="totalUserPages > 1" class="flex justify-center items-center space-x-4 mt-6">
            <button
              @click="currentUserPage = Math.max(1, currentUserPage - 1)"
              :disabled="currentUserPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentUserPage }} sur {{ totalUserPages }}
            </span>
            <button
              @click="currentUserPage = Math.min(totalUserPages, currentUserPage + 1)"
              :disabled="currentUserPage === totalUserPages"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <!-- Section Commandes -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50">
        <div class="p-6 border-b border-gray-200/50">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Gestion des Commandes</h2>
              <p class="text-gray-600 text-sm mt-1">{{ orders.length }} commande(s) au total</p>
            </div>
          </div>
        </div>

        <!-- Liste des commandes -->
        <div class="p-6">
          <div class="space-y-4">
            <div 
              v-for="order in paginatedOrders" 
              :key="order.orderId" 
              class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-semibold text-gray-900">Commande #{{ order.orderId }}</h3>
                    <span class="px-2 py-1 text-xs rounded-full" :class="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
                  <p class="text-lg font-medium text-gray-900">{{ order.totalAmount }}€</p>
                </div>
                <div class="flex flex-col space-y-2">
                  <button 
                    @click="downloadInvoice(order.orderId)" 
                    class="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Facture</span>
                  </button>
                  <button 
                    v-if="order.refundRequested && order.refundId"
                    @click="downloadCreditNote(order.orderId, order.refundId)"
                    class="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Avoir</span>
                  </button>
                </div>
              </div>

              <!-- Gestion des retours -->
              <div v-if="order.returnRequested" class="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center space-x-2 mb-2">
                      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span class="font-medium text-orange-800">Demande de retour</span>
                      <span class="px-2 py-1 text-xs rounded-full" :class="getReturnStatusClass(order.returnStatus)">
                        {{ order.returnStatus }}
                      </span>
                    </div>
                    <p class="text-sm text-orange-700 mb-1"><strong>Raison:</strong> {{ order.returnReason }}</p>
                    <p class="text-sm text-orange-600">{{ formatDate(order.returnRequestDate) }}</p>
                  </div>
                  
                  <!-- Actions selon le statut -->
                  <div v-if="order.returnStatus === 'Requested'" class="flex space-x-2">
                    <button 
                      @click="approveReturn(order.orderId)"
                      class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Approuver</span>
                    </button>
                    <button 
                      @click="denyReturn(order.orderId)"
                      class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Refuser</span>
                    </button>
                  </div>
                </div>

                <!-- Informations de remboursement -->
                <div v-if="order.refundRequested" class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-blue-700">
                        <strong>Remboursement:</strong> {{ order.refundAmount }}€
                        <span class="ml-2 px-2 py-1 rounded text-xs" :class="getRefundStatusClass(order.refundStatus)">
                          {{ getRefundStatusText(order.refundStatus) }}
                        </span>
                      </p>
                      <p v-if="order.refundDate" class="text-xs text-blue-600 mt-1">
                        {{ formatDate(order.refundDate) }}
                      </p>
                    </div>
                    <button 
                      v-if="order.returnStatus === 'Approved' && (!order.refundRequested || order.refundStatus === 'failed')"
                      @click="processRefund(order.orderId)"
                      class="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {{ order.refundStatus === 'failed' ? 'Réessayer' : 'Rembourser' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination commandes -->
          <div v-if="totalOrderPages > 1" class="flex justify-center items-center space-x-4 mt-6">
            <button
              @click="currentOrderPage = Math.max(1, currentOrderPage - 1)"
              :disabled="currentOrderPage === 1"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentOrderPage }} sur {{ totalOrderPages }}
            </span>
            <button
              @click="currentOrderPage = Math.min(totalOrderPages, currentOrderPage + 1)"
              :disabled="currentOrderPage === totalOrderPages"
              class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { fetchUsers, createUser as createNewUser, updateUser as updateExistingUser, fetchAllOrders, downloadInvoice } from '../services/userService';
import ConfirmButton from '../components/ConfirmButton.vue';
import { User } from '../types/User';
import { Order } from '../types/Order';
import { useNotifications } from '../composables/useNotifications';

export default defineComponent({
  name: 'AdminDashboard',
  components: { ConfirmButton },
  setup() {
    const { showSuccess, showError } = useNotifications();
    const users = ref<User[]>([]);
    const orders = ref<Order[]>([]);
    const filteredOrders = ref<Order[]>([]);
    const newUser = ref<User>({
      userId: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      shippingAddress: '',
      role: 'ROLE_USER',
    });
    const editUserForm = ref<User | null>(null);
    const showAddUserForm = ref(false);
    
    // Pagination
    const currentUserPage = ref(1);
    const currentOrderPage = ref(1);
    const itemsPerPage = 10;
    
    // Filtres
    const orderStatusFilter = ref('');
    const returnStatusFilter = ref('');

    // Computed pour la pagination des utilisateurs
    const totalUserPages = computed(() => Math.ceil(users.value.length / itemsPerPage));
    const paginatedUsers = computed(() => {
      const start = (currentUserPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return users.value.slice(start, end);
    });

    // Computed pour la pagination des commandes
    const totalOrderPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));
    const paginatedOrders = computed(() => {
      const start = (currentOrderPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredOrders.value.slice(start, end);
    });

    const loadUsers = async () => {
      try {
        console.log('Loading users...');
        users.value = await fetchUsers();
        console.log('Users loaded:', users.value.length);
      } catch (err) {
        console.error('Error loading users:', err);
        showError('Erreur', 'Impossible de charger les utilisateurs');
      }
    };

    const loadOrders = async () => {
      try {
        console.log('Loading orders...');
        orders.value = await fetchAllOrders();
        console.log('Orders loaded:', orders.value.length);
        filterOrders();
      } catch (err) {
        console.error('Error loading orders:', err);
        showError('Erreur', 'Impossible de charger les commandes');
      }
    };

    const filterOrders = () => {
      filteredOrders.value = orders.value.filter(order => {
        const statusMatch = !orderStatusFilter.value || order.status === orderStatusFilter.value;
        const returnMatch = !returnStatusFilter.value || 
          (returnStatusFilter.value === 'Requested' && order.returnRequested && order.returnStatus === 'Requested') ||
          (returnStatusFilter.value === 'Approved' && order.returnRequested && order.returnStatus === 'Approved') ||
          (returnStatusFilter.value === 'Denied' && order.returnRequested && order.returnStatus === 'Denied');
        
        return statusMatch && returnMatch;
      });
      currentOrderPage.value = 1; // Reset à la première page après filtrage
    };

    const addUser = async () => {
      try {
        await createNewUser(newUser.value);
        loadUsers();
        showAddUserForm.value = false;
        // Reset form
        newUser.value = {
          userId: 0,
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          shippingAddress: '',
          role: 'ROLE_USER',
        };
        showSuccess('Utilisateur ajouté', 'L\'utilisateur a été créé avec succès');
      } catch (err) {
        showError('Erreur', 'Impossible d\'ajouter l\'utilisateur');
      }
    };

    const editUser = (user: User) => {
      editUserForm.value = { ...user, password: '' }; 
    };

    const updateUser = async (id: number) => {
      try {
        if (editUserForm.value) {
          await updateExistingUser(id, editUserForm.value);
          loadUsers();
          editUserForm.value = null;
          showSuccess('Utilisateur modifié', 'Les informations ont été mises à jour avec succès');
        }
      } catch (err) {
        showError('Erreur', 'Impossible de modifier l\'utilisateur');
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getRoleClass = (role: string) => {
      const classes = {
        'ROLE_USER': 'bg-blue-100 text-blue-800',
        'ROLE_ADMIN': 'bg-red-100 text-red-800',
        'ROLE_STORE_KEEPER': 'bg-green-100 text-green-800',
        'ROLE_COMPTA': 'bg-purple-100 text-purple-800'
      };
      return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const getRoleText = (role: string) => {
      const texts = {
        'ROLE_USER': 'Utilisateur',
        'ROLE_ADMIN': 'Administrateur',
        'ROLE_STORE_KEEPER': 'Gestionnaire Stock',
        'ROLE_COMPTA': 'Comptable'
      };
      return texts[role as keyof typeof texts] || role;
    };

    const getStatusClass = (status: string) => {
      const classes = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const getReturnStatusClass = (status: string | null) => {
      const classes = {
        'Requested': 'bg-orange-100 text-orange-800',
        'Approved': 'bg-blue-100 text-blue-800',
        'Denied': 'bg-red-100 text-red-800',
        'Processed': 'bg-green-100 text-green-800'
      };
      return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const approveReturn = async (orderId: number) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/return/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          showSuccess('Retour approuvé', 'La demande de retour a été approuvée avec succès');
          loadOrders();
        } else {
          const error = await response.json();
          showError('Erreur', error.message || 'Erreur lors de l\'approbation du retour');
        }
      } catch (err) {
        showError('Erreur', 'Erreur lors de l\'approbation du retour');
      }
    };

    const denyReturn = async (orderId: number) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/return/deny`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          showSuccess('Retour refusé', 'La demande de retour a été refusée');
          loadOrders();
        } else {
          const error = await response.json();
          showError('Erreur', error.message || 'Erreur lors du refus du retour');
        }
      } catch (err) {
        showError('Erreur', 'Erreur lors du refus du retour');
      }
    };

    const processRefund = async (orderId: number) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/refund`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (response.ok) {
          showSuccess('Remboursement traité', result.message || 'Le remboursement a été traité avec succès');
          loadOrders();
        } else {
          showError('Erreur de remboursement', result.error || 'Erreur lors du traitement du remboursement');
        }
      } catch (err) {
        showError('Erreur', 'Erreur lors du traitement du remboursement');
      }
    };

    const getRefundStatusClass = (status: string | null) => {
      const classes = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'succeeded': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800'
      };
      return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const getRefundStatusText = (status: string | null) => {
      const texts = {
        'pending': 'En cours',
        'succeeded': 'Réussi',
        'failed': 'Échoué'
      };
      return texts[status as keyof typeof texts] || 'Inconnu';
    };

    const downloadCreditNote = async (orderId: number, refundId: string) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/credit-note`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `facture_avoir_${orderId}_${refundId.slice(-8)}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          showError('Erreur', 'Impossible de télécharger la facture d\'avoir');
        }
      } catch (err) {
        showError('Erreur', 'Erreur lors du téléchargement de la facture d\'avoir');
      }
    };

    onMounted(() => {
      loadUsers();
      loadOrders();
    });

    return {
      users,
      orders,
      filteredOrders,
      newUser,
      editUserForm,
      showAddUserForm,
      currentUserPage,
      currentOrderPage,
      totalUserPages,
      totalOrderPages,
      paginatedUsers,
      paginatedOrders,
      orderStatusFilter,
      returnStatusFilter,
      addUser,
      editUser,
      updateUser,
      loadUsers,
      loadOrders,
      filterOrders,
      downloadInvoice,
      formatDate,
      getRoleClass,
      getRoleText,
      getStatusClass,
      getReturnStatusClass,
      approveReturn,
      denyReturn,
      processRefund,
      getRefundStatusClass,
      getRefundStatusText,
      downloadCreditNote
    };
  },
});
</script>
