<script>
const isServer = false
const Popper = isServer ? function() {} : require('@popperjs/core/dist/umd/popper');  // eslint-disable-line

export default {
  props: {
    eventsEnabled: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'bottom'
    },
    boundariesPadding: {
      type: Number,
      default: 5
    },
    reference: Object,
    popper: Object,
    offset: {
      default: 0
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    transition: String,
    options: {
      type: Object,
      default () {
        return {
          modifiers: {
            computeStyle: {
              gpuAcceleration: false
            },
            preventOverflow: {
              boundariesElement: 'window'
            }
          }
        }
      }
    }
    // visible: {
    //     type: Boolean,
    //     default: false
    // }
  },
  emits: ['on-popper-show', 'on-popper-hide', 'created'],
  data () {
    return {
      visible: this.modelValue
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler (val) {
        this.visible = val
        this.$emit('update:modelValue', val)
      }
    },
    visible (val) {
      if (val) {
        if (this.handleIndexIncrease) this.handleIndexIncrease() // just use for Poptip
        this.updatePopper()
        this.$emit('on-popper-show')
      } else {
        this.$emit('on-popper-hide')
      }
      this.$emit('update:modelValue', val)
    }
  },
  updated () {
    this.$nextTick(() => this.updatePopper())
  },
  beforeUnmount () {
    if (isServer) return
    if (this.popperJS) {
      this.popperJS.destroy()
    }
  },
  methods: {
    createPopper () {
      if (isServer) return
      if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.placement)) {
        return
      }

      const options = this.options
      const popper = this.popper || this.$refs.popper
      const reference = this.reference || this.$refs.reference

      if (!popper || !reference) return

      if (this.popperJS && this.popperJS.hasOwnProperty('destroy')) {
        this.popperJS.destroy()
      }

      options.eventsEnabled = this.eventsEnabled

      options.placement = this.placement

      if (!options.modifiers.offset) {
        options.modifiers.offset = {}
      }
      options.modifiers.offset.offset = this.offset
      options.onCreate = () => {
        this.$nextTick(this.updatePopper)
        this.$emit('created', this)
      }

      this.popperJS = new Popper(reference, popper, options)
    },
    updatePopper () {
      if (isServer) return
      this.popperJS ? this.popperJS.update() : this.createPopper()
    },
    doDestroy () {
      if (isServer) return
      if (this.visible) return
      this.popperJS.destroy()
      this.popperJS = null
    }
  }
}
</script>
