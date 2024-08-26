// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import MyTable from './components/MyTable.vue'
import Saved from './components/Saved.vue'
import Trash from './components/Trash.vue'



const routes = [
  { path: '/', component: MyTable },
  { path: '/trash', component: Trash },
  { path: '/saved', component: Saved }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router



