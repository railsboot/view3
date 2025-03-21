<template>
  <div ref="affix">
    <div
      ref="point"
      :class="classes"
      :style="styles"
    >
      <slot />
    </div>
    <div
      v-show="slot"
      :style="slotStyle"
    />
  </div>
</template>
<script>
import { on, off } from '../utils/dom'
const prefixCls = 'ivu-affix'

function getScroll (target, top) {
  const prop = top ? 'pageYOffset' : 'pageXOffset'
  const method = top ? 'scrollTop' : 'scrollLeft'

  let ret = target[prop]

  if (typeof ret !== 'number') {
    ret = window.document.documentElement[method]
  }

  return ret
}

function getOffset (element) {
  const rect = element.getBoundingClientRect()

  const scrollTop = getScroll(window, true)
  const scrollLeft = getScroll(window)

  const docEl = window.document.body
  const clientTop = docEl.clientTop || 0
  const clientLeft = docEl.clientLeft || 0

  return {
    top: rect.top + scrollTop - clientTop,
    left: rect.left + scrollLeft - clientLeft
  }
}

export default {
  name: 'Affix',
  props: {
    offsetTop: {
      type: Number,
      default: 0
    },
    offsetBottom: {
      type: Number
    },
    useCapture: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      affix: false,
      styles: {},
      slot: false,
      slotStyle: {}
    }
  },
  computed: {
    offsetType () {
      let type = 'top'
      if (this.offsetBottom >= 0) {
        type = 'bottom'
      }

      return type
    },
    classes () {
      return [
        {
          [`${prefixCls}`]: this.affix
        }
      ]
    }
  },
  mounted () {
    //            window.addEventListener('scroll', this.handleScroll, false);
    //            window.addEventListener('resize', this.handleScroll, false);
    on(window, 'scroll', this.handleScroll, this.useCapture)
    on(window, 'resize', this.handleScroll, this.useCapture)
    this.$nextTick(() => {
      this.handleScroll()
    })
  },
  beforeUnmount () {
    //            window.removeEventListener('scroll', this.handleScroll, false);
    //            window.removeEventListener('resize', this.handleScroll, false);
    off(window, 'scroll', this.handleScroll, this.useCapture)
    off(window, 'resize', this.handleScroll, this.useCapture)
  },
  methods: {
    handleScroll () {
      const affix = this.affix
      const scrollTop = getScroll(window, true)
      const elOffset = getOffset(this.$refs.affix)
      const windowHeight = window.innerHeight
      const elHeight = this.$refs.affix.getElementsByTagName('div')[0].offsetHeight

      // Fixed Top
      if ((elOffset.top - this.offsetTop) < scrollTop && this.offsetType === 'top' && !affix) {
        this.affix = true
        this.slotStyle = {
          width: this.$refs.point.clientWidth + 'px',
          height: this.$refs.point.clientHeight + 'px'
        }
        this.slot = true
        this.styles = {
          top: `${this.offsetTop}px`,
          left: `${elOffset.left}px`,
          width: `${this.$refs.affix.offsetWidth}px`
        }

        this.$emit('on-change', true)
      } else if ((elOffset.top - this.offsetTop) > scrollTop && this.offsetType === 'top' && affix) {
        this.slot = false
        this.slotStyle = {}
        this.affix = false
        this.styles = null

        this.$emit('on-change', false)
      }

      // Fixed Bottom
      if ((elOffset.top + this.offsetBottom + elHeight) > (scrollTop + windowHeight) && this.offsetType === 'bottom' && !affix) {
        this.affix = true
        this.styles = {
          bottom: `${this.offsetBottom}px`,
          left: `${elOffset.left}px`,
          width: `${this.$refs.affix.offsetWidth}px`
        }

        this.$emit('on-change', true)
      } else if ((elOffset.top + this.offsetBottom + elHeight) < (scrollTop + windowHeight) && this.offsetType === 'bottom' && affix) {
        this.affix = false
        this.styles = null

        this.$emit('on-change', false)
      }
    }
  }
}
</script>
