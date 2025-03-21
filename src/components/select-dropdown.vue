<template>
  <div
    class="ivu-select-dropdown"
    :class="className"
    :style="styles"
  >
    <slot />
  </div>
</template>
<script>
import { getStyle } from '../utils/assist';  // eslint-disable-line
import { transferIndex, transferIncrease } from '../utils/transfer-queue'
import Emitter from '../mixins/emitter'

const isServer = false
const Popper = isServer ? function () {} : require('@popperjs/core/dist/umd/popper')

export default {
  name: 'SelectDropdown',
  mixins: [Emitter],
  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    },
    className: {
      type: String
    },
    transfer: {
      type: Boolean
    }
  },
  data () {
    return {
      popper: null,
      width: '',
      popperStatus: false,
      tIndex: this.handleGetIndex()
    }
  },
  computed: {
    styles () {
      const style = {}
      if (this.width) style.minWidth = `${this.width}px`
      if (this.width) style.maxWidth = `${this.width}px`

      if (this.transfer) style['z-index'] = 1060 + this.tIndex

      return style
    }
  },
  created () {
    this.mitt.on('on-update-popper', this.update)
    this.mitt.on('on-destroy-popper', this.destroy)
  },
  beforeUnmount () {
    this.mitt.off('on-update-popper', this.update)
    this.mitt.off('on-destroy-popper', this.destroy)

    if (this.popper) {
      this.popper.destroy()
      this.popper = null
    }
  },
  methods: {
    update () {
      if (isServer) return
      this.$nextTick(() => {
        if (this.popper) {
          this.popper.update()
          this.popperStatus = true
        } else {
          this.popper = new Popper(this.$parent.$parent.$refs.reference, this.$el, {
            eventsEnabled: false,
            placement: this.placement,
            modifiers: {
              computeStyle: {
                gpuAcceleration: false
              },
              preventOverflow: {
                boundariesElement: 'window'
              }
            },
            onCreate: () => {
              this.resetTransformOrigin()
              this.$nextTick(this.popper.update())
            },
            onUpdate: () => {
              this.resetTransformOrigin()
            }
          })
        }
        // set a height for parent is Modal and Select's width is 100%
        if (this.$parent.$options.name === 'VSelect') {
          this.width = parseInt(getStyle(this.$parent.$el, 'width'))
        } else if (this.$parent.$parent.$options.name === 'VSelect') {
          this.width = parseInt(getStyle(this.$parent.$parent.$el, 'width'))
        }
        this.tIndex = this.handleGetIndex()
      })
    },
    destroy () {
      if (this.popper) {
        setTimeout(() => {
          if (this.popper && !this.popperStatus) {
            this.popper.destroy()
            this.popper = null
          }
          this.popperStatus = false
        }, 300)
      }
    },
    resetTransformOrigin () {
      // 不判断，Select 会报错，不知道为什么
      if (!this.popper) return

      const x_placement = this.popper.popper.getAttribute('x-placement')
      const placementStart = x_placement.split('-')[0]
      const placementEnd = x_placement.split('-')[1]
      const leftOrRight = x_placement === 'left' || x_placement === 'right'
      if (!leftOrRight) {
        this.popper.popper.style.transformOrigin = placementStart === 'bottom' || (placementStart !== 'top' && placementEnd === 'start') ? 'center top' : 'center bottom'
      }
    },
    handleGetIndex () {
      transferIncrease()
      return transferIndex
    }
  }
}
</script>
