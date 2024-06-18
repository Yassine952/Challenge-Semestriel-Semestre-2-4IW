<template>
  <div class="admin-panel">
    <h1>Admin Panel</h1>
    <section class="products">
      <h2>Manage Products</h2>
      <form @submit.prevent="createProduct">
        <div>
          <label for="productName">Name:</label>
          <input type="text" v-model="newProduct.name" required />
        </div>
        <div>
          <label for="productDescription">Description:</label>
          <input type="text" v-model="newProduct.description" required />
        </div>
        <div>
          <label for="productCategory">Category:</label>
          <input type="text" v-model="newProduct.category" required />
        </div>
        <div>
          <label for="productBrand">Brand:</label>
          <input type="text" v-model="newProduct.brand" required />
        </div>
        <div>
          <label for="productPrice">Price:</label>
          <input type="number" v-model="newProduct.price" required />
        </div>
        <div>
          <label for="productOnSale">On Sale:</label>
          <input type="checkbox" v-model="newProduct.onSale" />
        </div>
        <div>
          <label for="productInStock">In Stock:</label>
          <input type="checkbox" v-model="newProduct.inStock" />
        </div>
        <button type="submit">Add Product</button>
      </form>
      <div v-for="product in products" :key="product._id" class="product-item">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p>Category: {{ product.category }}</p>
        <p>Brand: {{ product.brand }}</p>
        <p>Price: {{ product.price }} €</p>
        <p v-if="product.onSale">On Sale</p>
        <p v-if="!product.inStock">Out of Stock</p>
        <button @click="deleteProduct(product._id)">Delete</button>
      </div>
    </section>
    <section class="users">
      <h2>Manage Users</h2>
      <form @submit.prevent="createUser">
        <div>
          <label for="userName">Email:</label>
          <input type="email" v-model="newUser.email" required />
        </div>
        <div>
          <label for="userPassword">Password:</label>
          <input type="password" v-model="newUser.password" required />
        </div>
        <button type="submit">Add User</button>
      </form>
      <div v-for="user in users" :key="user._id" class="user-item">
        <p>{{ user.email }}</p>
        <button @click="deleteUser(user._id)">Delete</button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      products: [],
      users: [],
      newProduct: {
        name: '',
        description: '',
        category: '',
        brand: '',
        price: 0,
        onSale: false,
        inStock: true
      },
      newUser: {
        email: '',
        password: ''
      }
    };
  },
  methods: {
    async fetchProducts() {
      const response = await fetch('http://localhost:8000/api/products');
      this.products = await response.json();
    },
    async fetchUsers() {
      const response = await fetch('http://localhost:8000/api/auth');
      this.users = await response.json();
    },
    async createProduct() {
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newProduct)
      });

      console.log('Response:', response);
      if (response.ok) {
        this.fetchProducts();
        this.newProduct = {
          name: '',
          description: '',
          category: '',
          brand: '',
          price: 0,
          onSale: false,
          inStock: true
        };
      }else {
    console.error('Failed to create product:', response.statusText); // Debugging line
  }
    },
    async createUser() {
      const response = await fetch('http://localhost:8000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.newUser)
      });
      if (response.ok) {
        this.fetchUsers();
        this.newUser = {
          email: '',
          password: ''
        };
      }
    },
    async deleteProduct(id) {
      const response = await fetch(`http://localhost:8000/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.fetchProducts();
      }
    },
    async deleteUser(id) {
      const response = await fetch(`http://localhost:8000/api/auth/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        this.fetchUsers();
      }
    }
  },
  created() {
    this.fetchProducts();
    this.fetchUsers();
  }
};
</script>

<style scoped>
/* Ajoutez vos styles ici */
</style>
