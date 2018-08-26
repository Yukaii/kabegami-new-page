<template>
  <div class="notifications-container">
    <div class="flash"
      :class="['notification', typeClass(not.type), { removing: isRemoving(not) }]"
      v-for="not in notifications"
      :id="not.id"
      :key="not.id"
    >
      <button
        class="flash-close js-flash-close"
        type="button"
        @click.prevent="clearNotification(not.id)">x</button>
      {{ not.message }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component';

const events = new Vue()

type NotifyOptions = {
  type?: 'info' | 'warn' | 'error',
  message: string,
  duration?: number,
}
export function notify ({ type = 'info', duration = 10000, message } : NotifyOptions) {
  events.$emit('notify', { type, duration, message })
}

const AppProps = Vue.extend({
  props: {
    type: String
  }
})

@Component
export default class NotificationCenter extends AppProps {
  notificationMap: { [key: string]: Object } = {}

  mounted () {
    events.$on('notify', this.createNotification)
  }

  createNotification ({type, message, duration} : NotifyOptions) {
    const notification = {
      id: window.performance.now(),
      type,
      message
    }

    this.notificationMap = { ...this.notificationMap, [notification.id]: notification }
    window.setTimeout(() => {
      this.notificationMap = {
        ...this.notificationMap,
        [notification.id]: {
          ...notification,
          isRemoving: true
        }
      }

      this.$el.querySelector(`.notification[id="${notification.id}"]`).addEventListener('transitionend', () => {
        this.clearNotification(notification.id)
      })
    }, duration)
  }

  isRemoving (notification) {
    return notification.isRemoving
  }

  clearNotification (notificationId) {
    const notificationMap = {...this.notificationMap}
    delete notificationMap[notificationId]
    this.notificationMap = notificationMap
  }

  typeClass (type) {
    return `flash-${type}`
  }

  get notifications () {
    return Object.values(this.notificationMap);
  }
}
</script>

<style lang="scss" scoped>
.flash {
  margin: 0 0 15px;
  -ms-user-select: none;
  user-select: none;
}

.notifications-container {
  z-index: 1000;
  position: absolute;
  top: 0;
  right: 0;
  width: 50vw;
  max-width: 435px;
  min-width: 350px;
  padding-top: 1em;
  padding-right: 1em;
  opacity: 1;

  .notification.removing {
    opacity: 0;
    transform: translateY(-100%);
    transition: all ease-in-out 450ms;
  }
}
</style>
