<template>
  <span
    v-if="dot"
    ref="badge"
    :class="classes"
  >
    <slot />
    <sup
      v-show="badge"
      :class="dotClasses"
      :style="styles"
    />
  </span>
  <span
    v-else-if="status || color"
    ref="badge"
    :class="classes"
    class="ivu-badge-status"
  >
    <span
      :class="statusClasses"
      :style="statusStyles"
    />
    <span class="ivu-badge-status-text"><slot name="text">{{ text }}</slot></span>
  </span>
  <span
    v-else
    ref="badge"
    :class="classes"
  >
    <slot />
    <sup
      v-if="$slots.count"
      :style="styles"
      :class="customCountClasses"
    ><slot name="count" /></sup>
    <sup
      v-else-if="hasCount"
      v-show="badge"
      :style="styles"
      :class="countClasses"
    ><slot name="text">{{ finalCount }}</slot></sup>
  </span>
</template>
<script>
import { oneOf } from '../utils/assist'
const initColorList = ['blue', 'green', 'red', 'yellow', 'pink', 'magenta', 'volcano', 'orange', 'gold', 'lime', 'cyan', 'geekblue', 'purple']
const prefixCls = 'ivu-badge'

export default {
  name: 'Badge',
  props: {
    count: Number,
    dot: {
      type: Boolean,
      default: false
    },
    overflowCount: {
      type: [Number, String],
      default: 99
    },
    className: String,
    showZero: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    status: {
      validator (value) {
        return oneOf(value, ['success', 'processing', 'default', 'error', 'warning'])
      }
    },
    type: {
      validator (value) {
        return oneOf(value, ['success', 'primary', 'normal', 'error', 'warning', 'info'])
      }
    },
    offset: {
      type: Array
    },
    color: {
      type: String
    }
  },
  computed: {
    classes () {
      return `${prefixCls}`
    },
    dotClasses () {
      return `${prefixCls}-dot`
    },
    countClasses () {
      return [
                    `${prefixCls}-count`,
                    {
                      [`${this.className}`]: !!this.className,
                      [`${prefixCls}-count-alone`]: this.alone,
                      [`${prefixCls}-count-${this.type}`]: !!this.type
                    }
      ]
    },
    customCountClasses () {
      return [
                    `${prefixCls}-count`,
                    `${prefixCls}-count-custom`,
                    {
                      [`${this.className}`]: !!this.className
                    }
      ]
    },
    statusClasses () {
      return [
                    `${prefixCls}-status-dot`,
                    {
                      [`${prefixCls}-status-${this.status}`]: !!this.status,
                      [`${prefixCls}-status-${this.color}`]: !!this.color && oneOf(this.color, initColorList)
                    }
      ]
    },
    statusStyles () {
      return oneOf(this.color, initColorList) ? {} : { backgroundColor: this.color }
    },
    styles () {
      const style = {}
      if (this.offset && this.offset.length === 2) {
        style['margin-top'] = `${this.offset[0]}px`
        style['margin-right'] = `${this.offset[1]}px`
      }
      return style
    },
    finalCount () {
      if (this.text !== '') return this.text
      return parseInt(this.count) >= parseInt(this.overflowCount) ? `${this.overflowCount}+` : this.count
    },
    badge () {
      let status = false

      if (this.count) {
        status = !(parseInt(this.count) === 0)
      }

      if (this.dot) {
        status = true
        if (this.count !== null) {
          if (parseInt(this.count) === 0) {
            status = false
          }
        }
      }

      if (this.text !== '') status = true

      return status || this.showZero
    },
    hasCount () {
      if (this.count || this.text !== '') return true
      return this.showZero && parseInt(this.count) === 0
    },
    alone () {
      return this.$slots.default === undefined
    }
  }
}
</script>
