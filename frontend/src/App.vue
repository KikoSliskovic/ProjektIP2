<template>
  <v-app>
    <v-navigation-drawer expand-on-hover rail app>
      <v-divider></v-divider>

      <v-list density="compact" nav>
        <!-- Use 'to' with router-link to navigate -->
        <v-list-item prepend-icon="mdi-database" :to="{ path: '/' }" title="Proizvodi" value="products"></v-list-item>
        <v-list-item prepend-icon="mdi-star" :to="{ path: '/saved' }" title="Saved" value="saved"></v-list-item>
        <v-list-item prepend-icon="mdi-trash-can":to="{ path: '/trash' }" title="Trash" value="trash"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="prima" density="compact">
      <v-app-bar-title>Inventory App</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <RouterView></RouterView> <!-- This will load the components based on the route -->
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
// No changes needed in the script section
</script>
