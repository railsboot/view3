<template>
  <div :class="wrapClasses">
    <div
      v-if="!controlsOutside"
      :class="handlerClasses"
    >
      <a
        :class="upClasses"
        @click="up"
      >
        <span
          :class="innerUpClasses"
          @click="preventDefault"
        />
      </a>
      <a
        :class="downClasses"
        @click="down"
      >
        <span
          :class="innerDownClasses"
          @click="preventDefault"
        />
      </a>
    </div>
    <div
      v-if="controlsOutside"
      class="ivu-input-number-controls-outside-btn ivu-input-number-controls-outside-down"
      :class="{ 'ivu-input-number-controls-outside-btn-disabled': downDisabled }"
      @click="down"
    >
      <i class="ion ion-ios-remove" />
    </div>
    <div
      v-if="controlsOutside"
      class="ivu-input-number-controls-outside-btn ivu-input-number-controls-outside-up"
      :class="{ 'ivu-input-number-controls-outside-btn-disabled': upDisabled }"
      @click="up"
    >
      <i class="ion ion-ios-add" />
    </div>
    <div :class="inputWrapClasses">
      <input
        :id="elementId"
        :class="inputClasses"
        :disabled="itemDisabled"
        autocomplete="off"
        spellcheck="false"
        :autofocus="autofocus"
        :readonly="readonly || !editable"
        :name="name"
        :value="formatterValue"
        :placeholder="placeholder"
        @focus="focus"
        @blur="blur"
        @keydown="keyDown"
        @input="change"
        @mouseup="preventDefault"
        @change="change"
      >
    </div>
  </div>
</template>
<script>
import { oneOf, findComponentUpward } from '../utils/assist'
import Emitter from '../mixins/emitter'
import mixinsForm from '../mixins/form'

const prefixCls = 'ivu-input-number'
const iconPrefixCls = 'ion'

function addNum (num1, num2) {
  let sq1, sq2, m
  try {
    sq1 = num1.toString().split('.')[1].length
  } catch (e) {
    sq1 = 0
  }
  try {
    sq2 = num2.toString().split('.')[1].length
  } catch (e) {
    sq2 = 0
  }
  //        if (sq1 === 0 || sq2 === 0) {
  //            return num1 + num2;
  //        } else {
  //            m = Math.pow(10, Math.max(sq1, sq2));
  //            return (num1 * m + num2 * m) / m;
  //        }
  m = Math.pow(10, Math.max(sq1, sq2))
  return (Math.round(num1 * m) + Math.round(num2 * m)) / m
}

export default {
  name: 'InputNumber',
  mixins: [Emitter, mixinsForm],
  props: {
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: -Infinity
    },
    step: {
      type: Number,
      default: 1
    },
    activeChange: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: [Number, String],
      default: 1
    },
    size: {
      validator (value) {
        return oneOf(value, ['small', 'large', 'default'])
      },
      default () {
        return 'default'
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    name: {
      type: String
    },
    precision: {
      type: Number
    },
    elementId: {
      type: String
    },
    formatter: {
      type: Function
    },
    parser: {
      type: Function
    },
    placeholder: {
      type: String,
      default: ''
    },
    // 4.5.0
    controlsOutside: {
      type: Boolean,
      default: false
    }
  },
  emits: ['on-change', 'update:modelValue', 'on-focus', 'on-blur'],
  data () {
    return {
      focused: false,
      upDisabled: false,
      downDisabled: false,
      currentValue: this.modelValue
    }
  },
  computed: {
    wrapClasses () {
      return [
                    `${prefixCls}`,
                    {
                      [`${prefixCls}-${this.size}`]: !!this.size,
                      [`${prefixCls}-disabled`]: this.itemDisabled,
                      [`${prefixCls}-focused`]: this.focused,
                      [`${prefixCls}-controls-outside`]: this.controlsOutside
                    }
      ]
    },
    handlerClasses () {
      return `${prefixCls}-handler-wrap`
    },
    upClasses () {
      return [
                    `${prefixCls}-handler`,
                    `${prefixCls}-handler-up`,
                    {
                      [`${prefixCls}-handler-up-disabled`]: this.upDisabled
                    }
      ]
    },
    innerUpClasses () {
      return `${prefixCls}-handler-up-inner ${iconPrefixCls} ${iconPrefixCls}-ios-arrow-up`
    },
    downClasses () {
      return [
                    `${prefixCls}-handler`,
                    `${prefixCls}-handler-down`,
                    {
                      [`${prefixCls}-handler-down-disabled`]: this.downDisabled
                    }
      ]
    },
    innerDownClasses () {
      return `${prefixCls}-handler-down-inner ${iconPrefixCls} ${iconPrefixCls}-ios-arrow-down`
    },
    inputWrapClasses () {
      return `${prefixCls}-input-wrap`
    },
    inputClasses () {
      return `${prefixCls}-input`
    },
    precisionValue () {
      // can not display 1.0
      if (!this.currentValue) return this.currentValue
      return this.precision ? this.currentValue.toFixed(this.precision) : this.currentValue
    },
    formatterValue () {
      if (this.formatter && this.precisionValue !== null) {
        return this.formatter(this.precisionValue)
      } else {
        return this.precisionValue
      }
    }
  },
  watch: {
    modelValue (val) {
      this.currentValue = val
    },
    currentValue (val) {
      this.changeVal(val)
    },
    min () {
      this.changeVal(this.currentValue)
    },
    max () {
      this.changeVal(this.currentValue)
    }
  },
  mounted () {
    this.changeVal(this.currentValue)
  },
  methods: {
    preventDefault (e) {
      e.preventDefault()
    },
    up (e) {
      const targetVal = Number(e.target.value)
      if (this.upDisabled && isNaN(targetVal)) {
        return false
      }
      this.changeStep('up', e)
    },
    down (e) {
      const targetVal = Number(e.target.value)
      if (this.downDisabled && isNaN(targetVal)) {
        return false
      }
      this.changeStep('down', e)
    },
    changeStep (type, e) {
      if (this.itemDisabled || this.readonly) {
        return false
      }

      const targetVal = Number(e.target.value)
      let val = Number(this.currentValue)
      const step = Number(this.step)
      if (isNaN(val)) {
        return false
      }

      // input a number, and key up or down
      if (!isNaN(targetVal)) {
        if (type === 'up') {
          if (addNum(targetVal, step) <= this.max) {
            val = targetVal
          } else {
            return false
          }
        } else if (type === 'down') {
          if (addNum(targetVal, -step) >= this.min) {
            val = targetVal
          } else {
            return false
          }
        }
      }

      if (type === 'up') {
        val = addNum(val, step)
      } else if (type === 'down') {
        val = addNum(val, -step)
      }
      this.setValue(val)
    },
    setValue (val) {
      // 如果 step 是小数，且没有设置 precision，是有问题的
      if (val && !isNaN(this.precision)) val = Number(Number(val).toFixed(this.precision))

      const { min, max } = this
      if (val !== null) {
        if (val > max) {
          val = max
        } else if (val < min) {
          val = min
        }
      }

      this.$nextTick(() => {
        this.currentValue = val
        this.$emit('update:modelValue', val)
        this.$emit('on-change', val)
        this.dispatch('FormItem', 'on-form-change', val)
      })
    },
    focus (event) {
      this.focused = true
      this.$emit('on-focus', event)
    },
    blur () {
      this.focused = false
      this.$emit('on-blur')
      if (!findComponentUpward(this, ['DatePicker', 'TimePicker', 'Cascader', 'Search'])) {
        this.dispatch('FormItem', 'on-form-blur', this.currentValue)
      }
    },
    keyDown (e) {
      if (e.keyCode === 38) {
        e.preventDefault()
        this.up(e)
      } else if (e.keyCode === 40) {
        e.preventDefault()
        this.down(e)
      }
    },
    change (event) {
      if (event.type == 'change' && this.activeChange) return

      if (event.type == 'input' && !this.activeChange) return
      let val = event.target.value.trim()
      if (this.parser) {
        val = this.parser(val)
      }

      const isEmptyString = val.length === 0
      if (isEmptyString) {
        this.setValue(null)
        return
      }
      if (event.type == 'input' && val.match(/^\-?\.?$|\.$/)) return // prevent fire early if decimal. If no more input the change event will fire later

      val = Number(val)

      if (!isNaN(val)) {
        this.currentValue = val
        this.setValue(val)
      } else {
        event.target.value = this.currentValue
      }
    },
    changeVal (val) {
      val = Number(val)
      if (!isNaN(val)) {
        const step = this.step

        this.upDisabled = val + step > this.max
        this.downDisabled = val - step < this.min
      } else {
        this.upDisabled = true
        this.downDisabled = true
      }
    }
  }
}
</script>
