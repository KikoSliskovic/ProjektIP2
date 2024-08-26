<template>
  <div>
    <v-container>
      <v-data-table
      :items="deletedItems"
      :headers="headers"
      item-key="id"
      show-select
    >
      <template v-slot:item.action="{ item }">
        <v-btn @click="deleteProduct(item.id)" color="red" small>
          Delete Permanently
        </v-btn>
      </template>
    </v-data-table>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deletedItems: [],
      headers: [
        { title: 'Brand', value: 'name' },
        { title: 'Model', value: 'category' },
        { title: 'Code', value: 'sku' },
        { title: 'Variant', value: 'variant' },
        { title: 'Price', value: 'price' },
        { title: 'Status', value: 'status' },
        { title: '', value: 'action', sortable: false }
      ]
    };
  },

  methods: {
    async fetchTrashedProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/trash');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const trashedProducts = await response.json();
        this.deletedItems = trashedProducts;
      } catch (error) {
        console.error('Error fetching trashed products:', error);
      }
    },

    async deleteProduct(id) {
      try {
        const response = await fetch(`http://localhost:3000/api/trash/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.fetchTrashedProducts(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  },

  mounted() {
    this.fetchTrashedProducts();
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
