<template>
  <div>
    <v-container>
      <v-data-table
      :items="savedItems"
      :headers="headers"
      item-value="name"
      show-select
    >
      <template v-slot:item.action="{ item }">
        <v-btn color="white" small @click="unsaveProduct(item.id)">
          <v-icon>mdi-star</v-icon>
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
      savedItems: [],
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
    async fetchSavedProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/saved-products');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.savedItems = await response.json();
      } catch (error) {
        console.error('Error fetching saved products:', error);
      }
    },

    async unsaveProduct(id) {
      try {
        const response = await fetch(`http://localhost:3000/api/products/${id}/unsave`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        this.savedItems = this.savedItems.filter(item => item.id !== id);

        // Also update the starred status in MyTable.vue if possible
        this.$emit('unsave', id);
      } catch (error) {
        console.error('Error unsaving product:', error);
      }
    }
  },

  mounted() {
    this.fetchSavedProducts();
  }
};
</script>

<style scoped>
/* Add any additional styles here */
</style>
