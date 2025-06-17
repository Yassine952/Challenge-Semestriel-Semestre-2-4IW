<template>
  <div class="promo-code-section bg-gray-50 p-4 rounded-lg">
    <h3 class="text-lg font-medium mb-4 text-gray-800">🎫 Code Promo</h3>
    
    <!-- Formulaire de saisie -->
    <div v-if="!appliedPromo" class="space-y-3">
      <div class="flex space-x-2">
        <input
          type="text"
          v-model="promoCode"
          @input="promoCode = $event.target.value.toUpperCase()"
          placeholder="Entrez votre code promo"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="isValidating"
        />
        <button
          @click="validatePromo"
          :disabled="!promoCode.trim() || isValidating"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isValidating ? 'Validation...' : 'Appliquer' }}
        </button>
      </div>
      
      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="text-red-600 text-sm">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Code promo appliqué -->
    <div v-if="appliedPromo" class="space-y-3">
      <div class="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-green-600 font-medium">✅ {{ appliedPromo.code }}</span>
            <span class="text-sm text-gray-600">{{ appliedPromo.description }}</span>
          </div>
          <div class="text-sm text-green-700 mt-1">
            <div>Réduction : {{ formatDiscount(appliedPromo) }}</div>
            <div v-if="appliedPromo.promotion?.maxDiscountAmount" class="text-xs text-gray-600">
              Plafond maximum : {{ appliedPromo.promotion.maxDiscountAmount }}€
            </div>
          </div>
        </div>
        <button
          @click="removePromo"
          class="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Retirer
        </button>
      </div>
      
      <!-- Détails de la réduction -->
      <div class="text-sm text-gray-600">
        <div class="flex justify-between">
          <span>Sous-total :</span>
          <span>{{ cartTotal.toFixed(2) }}€</span>
        </div>
        <div class="flex justify-between text-green-600 font-medium">
          <span>Réduction :</span>
          <span>-{{ discountAmount.toFixed(2) }}€</span>
        </div>
        <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Total :</span>
          <span>{{ finalTotal.toFixed(2) }}€</span>
        </div>
      </div>
    </div>

    <!-- Messages de succès -->
    <div v-if="successMessage" class="text-green-600 text-sm mt-2">
      {{ successMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { validatePromoCode } from '../services/promotionService';
import { PromoValidationResult } from '../types/Promotion';

export default defineComponent({
  name: 'PromoCodeInput',
  props: {
    cartTotal: {
      type: Number,
      required: true
    },
    cartItems: {
      type: Array,
      required: true
    }
  },
  emits: ['promo-applied', 'promo-removed'],
  setup(props, { emit }) {
    const promoCode = ref('');
    const isValidating = ref(false);
    const appliedPromo = ref<PromoValidationResult | null>(null);
    const discountAmount = ref(0);
    const errorMessage = ref('');
    const successMessage = ref('');

    const finalTotal = computed(() => {
      return Math.max(0, props.cartTotal - discountAmount.value);
    });

    const validatePromo = async () => {
      if (!promoCode.value.trim()) return;

      isValidating.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const result = await validatePromoCode(
          promoCode.value.trim(),
          props.cartTotal,
          props.cartItems
        );

        if (result.valid) {
          appliedPromo.value = result;
          discountAmount.value = result.discountAmount || 0;
          successMessage.value = result.message;
          emit('promo-applied', {
            code: promoCode.value.trim(),
            discount: discountAmount.value,
            finalTotal: finalTotal.value,
            promotion: result.promotion
          });
          
          promoCode.value = '';
        } else {
          errorMessage.value = result.message;
        }
      } catch (error: any) {
        errorMessage.value = error.response?.data?.message || 'Erreur lors de la validation du code promo';
      } finally {
        isValidating.value = false;
      }
    };

    const removePromo = () => {
      appliedPromo.value = null;
      discountAmount.value = 0;
      errorMessage.value = '';
      successMessage.value = '';
      
      emit('promo-removed');
    };

    const formatDiscount = (promo: PromoValidationResult) => {
      if (!promo.promotion) return '';
      
      const { discountType, discountValue } = promo.promotion;
      if (discountType === 'percentage') {
        return `${discountValue}%`;
      } else {
        return `${discountValue}€`;
      }
    };
    watch(() => props.cartTotal, () => {
      if (appliedPromo.value) {
        validatePromo();
      }
    });

    return {
      promoCode,
      isValidating,
      appliedPromo,
      discountAmount,
      errorMessage,
      successMessage,
      finalTotal,
      validatePromo,
      removePromo,
      formatDiscount
    };
  }
});
</script>

<style scoped>
.promo-code-section {
  border: 1px solid #e5e7eb;
}
</style> 