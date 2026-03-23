<template>
  <article class="message">
    <div class="message-header">
      <p>{{title}}</p>
    </div>
    <div class="message-body">
      <div class="table-container">
        <table class="table is-fullwidth" v-if="object && !isList">
          <thead>
            <tr>
              <th v-for="[k] of Object.entries(object)" :key="k">{{k}}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="[k, v] of Object.entries(object)" :key="k">{{v}}</td>
            </tr>
          </tbody>
        </table>
        <table class="table is-fullwidth" v-else-if="object && isList && object[0]">
          <thead>
          <tr>
            <th v-for="[k] of Object.entries(object[0])" :key="k">{{k}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(child, index) of object" :key="index">
            <td v-for="[k, v] of Object.entries(child)" :key="k">{{v}}</td>
          </tr>
          </tbody>
        </table>
        <p v-else>Keine Daten verfügbar</p>
      </div>
    </div>
  </article>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ObjectTablePrinter',
  props: {
    title: String,
    object: Object,
    isList: Boolean
  },
});
</script>



<style scoped>

</style>
