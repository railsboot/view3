<template>
  <div
    v-click-outside:[capture]="handleClose"
    :class="classes"
  >
    <div
      ref="reference"
      :class="wrapClasses"
      @click="toggleVisible"
    >
      <input
        :name="name"
        :value="currentValue"
        type="hidden"
      >
      <Icon
        :type="arrowType"
        :custom="customArrowType"
        :size="arrowSize"
        :class="arrowClasses"
      />
      <div
        ref="input"
        :tabindex="itemDisabled ? undefined : 0"
        :class="inputClasses"
        @keydown.tab="onTab"
        @keydown.esc="onEscape"
        @keydown.up="onArrow"
        @keydown.down="onArrow"
      >
        <div :class="[prefixCls + '-color']">
          <div
            v-show="modelValue === '' && !visible"
            :class="[prefixCls + '-color-empty']"
          >
            <i :class="[iconPrefixCls, iconPrefixCls + '-ios-close']" />
          </div>
          <div
            v-show="modelValue || visible"
            :style="displayedColorStyle"
          />
        </div>
      </div>
    </div>
    <transition name="transition-drop">
      <Drop
        v-show="visible"
        ref="drop"
        v-transfer-dom
        :placement="placement"
        :data-transfer="transfer"
        :transfer="transfer"
        :class="dropClasses"
      >
        <transition name="fade">
          <div
            v-if="visible"
            :class="[prefixCls + '-picker']"
          >
            <div :class="[prefixCls + '-picker-wrapper']">
              <div :class="[prefixCls + '-picker-panel']">
                <Saturation
                  ref="saturation"
                  v-model="saturationColors"
                  :focused="visible"
                  @change="childChange"
                  @keydown.native.tab="handleFirstTab"
                />
              </div>
              <div
                v-if="hue"
                :class="[prefixCls + '-picker-hue-slider']"
              >
                <Hue
                  v-model="saturationColors"
                  @change="childChange"
                />
              </div>
              <div
                v-if="alpha"
                :class="[prefixCls + '-picker-alpha-slider']"
              >
                <Alpha
                  v-model="saturationColors"
                  @change="childChange"
                />
              </div>
              <recommend-colors
                v-if="colors.length"
                :list="colors"
                :class="[prefixCls + '-picker-colors']"
                @picker-color="handleSelectColor"
              />
              <recommend-colors
                v-if="!colors.length && recommend"
                :list="recommendedColor"
                :class="[prefixCls + '-picker-colors']"
                @picker-color="handleSelectColor"
              />
            </div>
            <div :class="[prefixCls + '-confirm']">
              <span :class="confirmColorClasses">
                <template v-if="editable">
                  <VInput
                    ref="editColorInput"
                    :model-value="formatColor"
                    size="small"
                    @on-enter="handleEditColor"
                    @on-blur="handleEditColor"
                  />
                </template>
                <template v-else>{{ formatColor }}</template>
              </span>
              <VButton
                ref="clear"
                :tabindex="0"
                size="small"
                @click.native="handleClear"
                @keydown.enter="handleClear"
                @keydown.native.esc="closer"
              >
                {{ t('i.datepicker.clear') }}
              </VButton>
              {{ ' ' }}
              <VButton
                ref="ok"
                :tabindex="0"
                size="small"
                type="primary"
                @click.native="handleSuccess"
                @keydown.native.tab="handleLastTab"
                @keydown.enter="handleSuccess"
                @keydown.native.esc="closer"
              >
                {{ t('i.datepicker.ok') }}
              </VButton>
            </div>
          </div>
        </transition>
      </Drop>
    </transition>
  </div>
</template>

<script>
import tinycolor from 'tinycolor2'
import { directive as clickOutside } from '../directives/v-click-outside-x'
import TransferDom from '../directives/transfer-dom'
import Drop from './select-dropdown.vue'
import RecommendColors from './recommend-colors.vue'
import Saturation from './saturation.vue'
import Hue from './hue.vue'
import Alpha from './alpha'
import VInput from './input'
import VButton from './button'
import Icon from './icon'
import Locale from '../mixins/locale'
import { oneOf } from '../utils/assist'
import Emitter from '../mixins/emitter'
import mixinsForm from '../mixins/form'
import Prefixes from '../mixins/color-prefix'
import { changeColor, toRGBAString } from '../utils/color'

export default {
  name: 'ColorPicker',

  components: { Drop, RecommendColors, Saturation, Hue, Alpha, VInput, VButton, Icon },

  directives: { clickOutside, TransferDom },

  mixins: [Emitter, Locale, Prefixes, mixinsForm],

  props: {
    modelValue: {
      type: String,
      default: undefined
    },
    hue: {
      type: Boolean,
      default: true
    },
    alpha: {
      type: Boolean,
      default: false
    },
    recommend: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      validator (value) {
        return oneOf(value, ['hsl', 'hsv', 'hex', 'rgb'])
      },
      default: undefined
    },
    colors: {
      type: Array,
      default () {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      validator (value) {
        return oneOf(value, ['small', 'large', 'default'])
      },
      default () {
        return 'default'
      }
    },
    hideDropDown: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      validator (value) {
        return oneOf(value, [
          'top',
          'top-start',
          'top-end',
          'bottom',
          'bottom-start',
          'bottom-end',
          'left',
          'left-start',
          'left-end',
          'right',
          'right-start',
          'right-end'
        ])
      },
      default: 'bottom'
    },
    transfer: {
      type: Boolean,
      default () {
        return false
      }
    },
    name: {
      type: String,
      default: undefined
    },
    editable: {
      type: Boolean,
      default: true
    },
    // 4.0.0
    capture: {
      type: Boolean,
      default () {
        return true
      }
    },
    transferClassName: {
      type: String
    }
  },

  emits: ['on-open-change', 'on-active-change', 'update:modelValue', 'on-pick-success', 'on-pick-clear', 'on-change'],

  data () {
    return {
      val: changeColor(this.modelValue),
      currentValue: this.modelValue,
      dragging: false,
      visible: false,
      recommendedColor: [
        '#2d8cf0',
        '#19be6b',
        '#ff9900',
        '#ed4014',
        '#00b5ff',
        '#19c919',
        '#f9e31c',
        '#ea1a1a',
        '#9b1dea',
        '#00c2b1',
        '#ac7a33',
        '#1d35ea',
        '#8bc34a',
        '#f16b62',
        '#ea4ca3',
        '#0d94aa',
        '#febd79',
        '#5d4037',
        '#00bcd4',
        '#f06292',
        '#cddc39',
        '#607d8b',
        '#000000',
        '#ffffff'
      ]
    }
  },

  computed: {
    arrowClasses () {
      return [
                `${this.inputPrefixCls}-icon`,
                `${this.inputPrefixCls}-icon-normal`
      ]
    },
    transition () {
      return oneOf(this.placement, ['bottom-start', 'bottom', 'bottom-end']) ? 'slide-up' : 'fade'
    },
    saturationColors: {
      get () {
        return this.val
      },
      set (newVal) {
        this.val = newVal
        this.$emit('on-active-change', this.formatColor)
      }
    },
    classes () {
      return [
                `${this.prefixCls}`,
                {
                  [`${this.prefixCls}-transfer`]: this.transfer
                }
      ]
    },
    wrapClasses () {
      return [
                `${this.prefixCls}-rel`,
                `${this.prefixCls}-${this.size}`,
                `${this.inputPrefixCls}-wrapper`,
                `${this.inputPrefixCls}-wrapper-${this.size}`,
                {
                  [`${this.prefixCls}-disabled`]: this.itemDisabled
                }
      ]
    },
    inputClasses () {
      return [
                `${this.prefixCls}-input`,
                `${this.inputPrefixCls}`,
                `${this.inputPrefixCls}-${this.size}`,
                {
                  [`${this.prefixCls}-focused`]: this.visible,
                  [`${this.prefixCls}-disabled`]: this.itemDisabled
                }
      ]
    },
    dropClasses () {
      return [
                `${this.transferPrefixCls}-no-max-height`,
                {
                  [`${this.prefixCls}-transfer`]: this.transfer,
                  [`${this.prefixCls}-hide-drop`]: this.hideDropDown,
                  [this.transferClassName]: this.transferClassName
                }
      ]
    },
    displayedColorStyle () {
      return { backgroundColor: toRGBAString(this.visible ? this.saturationColors.rgba : tinycolor(this.modelValue).toRgb()) }
    },
    formatColor () {
      const { format, saturationColors } = this

      if (format) {
        if (format === 'hsl') {
          return tinycolor(saturationColors.hsl).toHslString()
        }

        if (format === 'hsv') {
          return tinycolor(saturationColors.hsv).toHsvString()
        }

        if (format === 'hex') {
          return saturationColors.hex
        }

        if (format === 'rgb') {
          return toRGBAString(saturationColors.rgba)
        }
      } else if (this.alpha) {
        return toRGBAString(saturationColors.rgba)
      }

      return saturationColors.hex
    },
    confirmColorClasses () {
      return [
                `${this.prefixCls}-confirm-color`,
                {
                  [`${this.prefixCls}-confirm-color-editable`]: this.editable
                }
      ]
    },
    // 3.4.0, global setting customArrow 有值时，arrow 赋值空
    arrowType () {
      return 'ios-arrow-down'
    },
    // 3.4.0, global setting
    customArrowType () {
      return ''
    },
    // 3.4.0, global setting
    arrowSize () {
      return ''
    }
  },

  watch: {
    modelValue (newVal) {
      this.val = changeColor(newVal)
    },
    visible (val) {
      this.val = changeColor(this.modelValue)
      this.$refs.drop[val ? 'update' : 'destroy']()
      this.$emit('on-open-change', Boolean(val))
    }
  },

  mounted () {
    this.mitt.on('on-escape-keydown', this.closer)
    this.mitt.on('on-dragging', this.setDragging)
  },

  methods: {
    setDragging (value) {
      this.dragging = value
    },
    handleClose (event) {
      if (this.visible) {
        if (this.dragging || event.type === 'mousedown') {
          if (this.$refs.editColorInput && event.target !== this.$refs.editColorInput.$el.querySelector('input')) {
            event.preventDefault()
          }
          return
        }

        if (this.transfer) {
          const { $el } = this.$refs.drop
          if ($el === event.target || $el.contains(event.target)) {
            return
          }
        }

        this.closer(event)
        return
      }

      this.visible = false
    },
    toggleVisible () {
      if (this.itemDisabled) {
        return
      }

      this.visible = !this.visible
      this.$refs.input.focus()
    },
    childChange (data) {
      this.colorChange(data)
    },
    colorChange (data, oldHue) {
      this.oldHue = this.saturationColors.hsl.h
      this.saturationColors = changeColor(data, oldHue || this.oldHue)
    },
    closer (event) {
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      this.visible = false
      this.$refs.input.focus()
    },
    handleButtons (event, value) {
      this.currentValue = value
      this.$emit('update:modelValue', value)
      this.$emit('on-change', value)
      this.dispatch('FormItem', 'on-form-change', value)
      this.closer(event)
    },
    handleSuccess (event) {
      this.handleButtons(event, this.formatColor)
      this.$emit('on-pick-success')
    },
    handleClear (event) {
      this.handleButtons(event, '')
      this.$emit('on-pick-clear')
    },
    handleSelectColor (color) {
      this.val = changeColor(color)
      this.$emit('on-active-change', this.formatColor)
    },
    handleEditColor (event) {
      const value = event.target.value
      this.handleSelectColor(value)
    },
    handleFirstTab (event) {
      if (event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        this.$refs.ok.$el.focus()
      }
    },
    handleLastTab (event) {
      if (!event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        this.$refs.saturation.$el.focus()
      }
    },
    onTab (event) {
      if (this.visible) {
        event.preventDefault()
      }
    },
    onEscape (event) {
      if (this.visible) {
        this.closer(event)
      }
    },
    onArrow (event) {
      if (!this.visible) {
        event.preventDefault()
        event.stopPropagation()
        this.visible = true
      }
    }
  }
}
</script>
