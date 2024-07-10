import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ProductList from '../views/ProductList.vue';
import AddProduct from '../views/AddProduct.vue';
import EditProduct from '../views/EditProduct.vue';
import UserList from '../views/UserList.vue';
import AdminPanel from '../views/AdminPanel.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/products', name: 'ProductList', component: ProductList },
  { path: '/add-product', name: 'AddProduct', component: AddProduct },
  { path: '/edit-product/:id', name: 'EditProduct', component: EditProduct },
  { path: '/users', name: 'UserList', component: UserList },
  { path: '/admin', name: 'AdminPanel', component: AdminPanel }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
