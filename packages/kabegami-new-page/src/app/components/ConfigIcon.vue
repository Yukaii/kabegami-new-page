<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';

const Usagi = require('./configIcons/usagi.svg')
const Chibimaruko = require('./configIcons/chibimaruko.svg')
const Doraemon = require('./configIcons/doraemon.svg')

const AppProps = Vue.extend({
  props: {
    iconName: String
  }
})

export const availableIcons = ['usagi', 'chibimaruko', 'doraemon']

@Component({
  components: {
    Usagi,
    Chibimaruko,
    Doraemon
  }
})
export default class ConfigIcon extends AppProps {
  render (createElement) {
    return createElement(this.iconName || 'usagi')
  }
}
</script>
