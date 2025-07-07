import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ResetPassword from '../views/ResetPassword.vue';
import ProductList from '../views/ProductList.vue';
import AddProduct from '../views/AddProduct.vue';
import EditProduct from '../views/EditProduct.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import DashboardAnalytics from '../views/DashboardAnalytics.vue';
import ProductSearch from '../views/ProductSearch.vue';
import Cart from '../views/Cart.vue';
import Profile from '../views/Profile.vue';
import PromotionList from '../views/PromotionList.vue';
import AddPromotion from '../views/AddPromotion.vue';
import EditPromotion from '../views/EditPromotion.vue';
import PrivacyPolicy from '../views/PrivacyPolicy.vue';
import LegalMentions from '../views/LegalMentions.vue';
import TermsAndConditions from '../views/TermsAndConditions.vue';
import StockDashboard from '../views/StockDashboard.vue';
import ComptaDashboard from '../views/ComptaDashboard.vue';
import NewsletterManager from '../views/NewsletterManager.vue';
import { jwtDecode } from 'jwt-decode';
import NotFound from '../views/NotFound.vue';
interface DecodedToken {
  role: string;
}

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/privacy-policy', name: 'PrivacyPolicy', component: PrivacyPolicy },
  { path: '/terms-and-conditions', name: 'TermsAndConditions', component: TermsAndConditions },
  { path: '/legal-mentions', name: 'LegalMentions', component: LegalMentions },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password/:token', name: 'ResetPassword', component: ResetPassword },
  { path: '/products', name: 'ProductList', component: ProductList, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/add-product', name: 'AddProduct', component: AddProduct, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/edit-product/:id', name: 'EditProduct', component: EditProduct, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/search', name: 'ProductSearch', component: ProductSearch },
  { path: '/cart', name: 'Cart', component: Cart, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/promotions', name: 'PromotionList', component: PromotionList, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/add-promotion', name: 'AddPromotion', component: AddPromotion, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/edit-promotion/:id', name: 'EditPromotion', component: EditPromotion, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresRole: 'ROLE_ADMIN' } },
  { path: '/dashboard-analytics', name: 'DashboardAnalytics', component: DashboardAnalytics, meta: { requiresAuth: true, requiresRole: 'ROLE_ADMIN' } },
  { path: '/stock-dashboard', name: 'StockDashboard', component: StockDashboard, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/compta-dashboard', name: 'ComptaDashboard', component: ComptaDashboard, meta: { requiresAuth: true, requiresRole: ['ROLE_COMPTA', 'ROLE_ADMIN'] } },
  { path: '/newsletter-manager', name: 'NewsletterManager', component: NewsletterManager, meta: { requiresAuth: true, requiresRole: ['ROLE_STORE_KEEPER', 'ROLE_ADMIN'] } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
  
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresAuth && to.meta.requiresRole) {
    const decoded: DecodedToken | null = token ? jwtDecode<DecodedToken>(token) : null;
    const userRole = decoded?.role ?? null;

    if (Array.isArray(to.meta.requiresRole)) {
      if (!to.meta.requiresRole.includes(userRole)) {
        next({ name: 'Home' });
      } else {
        next();
      }
    } else if (typeof to.meta.requiresRole === 'string') {
      if (userRole !== to.meta.requiresRole) {
        next({ name: 'Home' });
      } else {
        next();
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
