<template>
  <div>
    <!-- Fetch and Add Product buttons -->
    <v-row justify="center" class="mb-4" style="margin-top: 0px;">
      <v-col cols="auto">
        <v-btn 
          @click="dialog = true"
          color=""
          style="padding: 30px 22px; font-size: 18px; line-height: 0; padding-bottom: 26px;"
        >
          Add Product
        </v-btn>
      </v-col>
    </v-row>

    <!-- Products Table -->
    <v-container> 
      <v-data-table
        v-model="selected"
        :items="items"
        :headers="headers"
        item-key="id"
        show-select
      >
        <template v-slot:item.action="{ item }">
          <v-btn 
            :color="item.starred ? 'white' : ''"
            small 
            style="margin-right: 10px;" @click="toggleStar(item)">
            <v-icon>{{ item.starred ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
          </v-btn>
          <v-btn @click="editProduct(item)" color="" small style="margin-right: 10px;">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn @click="deleteProduct(item.id)" color="red" small>
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-container>

    <!-- Dialog for Adding a New Product -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add New Product</span>
        </v-card-title>
        <v-card-subtitle>
          <v-form ref="form">
            <v-text-field v-model="newProduct.name" label="Brand" required></v-text-field>
            <v-text-field v-model="newProduct.category" label="Model" required></v-text-field>
            <v-text-field v-model="newProduct.sku" label="Code" required></v-text-field>
            <v-text-field v-model="newProduct.variant" label="Variant"></v-text-field>
            <v-text-field v-model="newProduct.price" label="Price" type="number" required></v-text-field>
            <v-select v-model="newProduct.status" :items="['Active', 'Inactive']" label="Status"></v-select>
          </v-form>
        </v-card-subtitle>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="addProduct">Add</v-btn>
          <v-btn @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for Editing a Product -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit Product</span>
        </v-card-title>
        <v-card-subtitle>
          <v-form ref="form">
            <v-text-field v-model="currentProduct.name" label="Brand" required></v-text-field>
            <v-text-field v-model="currentProduct.category" label="Model" required></v-text-field>
            <v-text-field v-model="currentProduct.sku" label="Code" required></v-text-field>
            <v-text-field v-model="currentProduct.variant" label="Variant"></v-text-field>
            <v-text-field v-model="currentProduct.price" label="Price" type="number" required></v-text-field>
            <v-select v-model="currentProduct.status" :items="['Active', 'Inactive']" label="Status"></v-select>
          </v-form>
        </v-card-subtitle>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="updateProduct">Update</v-btn>
          <v-btn @click="editDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      editDialog: false,
      selected: [],
      items: [],
      headers: [
        { title: 'Brand', value: 'name' },
        { title: 'Model', value: 'category' },
        { title: 'Code', value: 'sku' },
        { title: 'Variant', value: 'variant' },
        { title: 'Price', value: 'price' },
        { title: 'Status', value: 'status' },
        { title: '', value: 'action', sortable: false }
      ],
      newProduct: {
        name: '',
        category: '',
        sku: '',
        variant: '',
        price: '',
        status: 'Active'
      },
      currentProduct: {}
    }
  },

  methods: {
    async fetchProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const products = await response.json();

        // Fetch saved products and mark them as starred
        const savedResponse = await fetch('http://localhost:3000/api/saved-products');
        const savedProducts = await savedResponse.json();
        const savedIds = new Set(savedProducts.map(product => product.id));

        this.items = products.map(product => ({
          ...product,
          starred: savedIds.has(product.id)
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },

    async addProduct() {
      try {
        const response = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.newProduct)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const addedProduct = await response.json();
        this.items.push({
          ...addedProduct,
          starred: false // Newly added products are not starred by default
        });
        this.dialog = false;
        // Reset form
        this.newProduct = {
          name: '',
          category: '',
          sku: '',
          variant: '',
          price: '',
          status: 'Active'
        };
      } catch (error) {
        console.error('Error adding product:', error);
      }
    },

    async editProduct(product) {
      this.currentProduct = { ...product };
      this.editDialog = true;
    },

    async updateProduct() {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${this.currentProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.currentProduct)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Fetch updated list of products
        await this.fetchProducts();
        this.editDialog = false;
      } catch (error) {
        console.error('Error updating product:', error);
      }
    },

    async toggleStar(item) {
      item.starred = !item.starred;

      try {
        if (item.starred) {
          // Save product to the saved_products table
          await fetch(`http://localhost:3000/api/products/${item.id}/save`, {
            method: 'POST'
          });
        } else {
          // Remove product from the saved_products table
          await fetch(`http://localhost:3000/api/products/${item.id}/unsave`, {
            method: 'DELETE'
          });
        }
      } catch (error) {
        console.error('Error toggling star:', error);
      }
    },

    async deleteProduct(id) {
      try {
        // Send a request to move the product to trash
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Fetch updated list of products
        await this.fetchProducts();
      } catch (error) {
        console.error('Error moving product to trash:', error);
      }
    }
  },

  mounted() {
    this.fetchProducts();
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
