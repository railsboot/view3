import { createApp, h } from 'vue'

import mountWithContext from '../utils/mount-with-context'
import Popper from '@popperjs/core/dist/umd/popper'
import Popover from '../components/popover'
import DynamicPopover from '../plugins/dynamic-popover'

let currentPopover
let currentObserver

function removeCurrentPopover () {
  if (currentPopover) {
    currentPopover.destroy()
    currentPopover.popper.remove()
    currentObserver.unobserve(currentPopover.popper)
  }
}

document.addEventListener('click', (e) => {
  if (currentPopover && !currentPopover.popper.contains(event.target)) {
    removeCurrentPopover()
  }
})

document.addEventListener('DOMContentLoaded', () => {
  if (DynamicPopover.app.config.globalProperties.$router) {
    DynamicPopover.app.config.globalProperties.$router.afterEach(() => {
      removeCurrentPopover()
    })
  }
})

export default {
  removeCurrentPopover,
  mounted (el, binding) {
    if (binding.value.disabled) return

    el.addEventListener(binding.value.trigger || 'click', () => {
      removeCurrentPopover()

      const instance = createApp({
        render () {
          return h(Popover, binding.value)
        }
      })

      const elem = mountWithContext(instance, DynamicPopover.app)

      if (binding.value.trigger === 'mouseenter') {
        elem.addEventListener('mouseleave', (event) => {
          if (!elem.contains(event.toElement)) {
            removeCurrentPopover()
          }
        })
      }

      const parentElem = document.querySelector('[data-popover-container]') || document.createElement('div')
      parentElem.setAttribute('data-popover-container', 'true')
      parentElem.classList.add('mdm')
      parentElem.appendChild(elem)
      document.body.appendChild(parentElem)

      const isInverseYPlacement = document.body.getBoundingClientRect().height - el.getBoundingClientRect().y < 200

      currentPopover = new Popper(el, elem, { placement: (isInverseYPlacement ? 'right-end' : binding.value.placement) || 'top' })

      currentPopover.trigger = binding.value.trigger

      currentObserver = new ResizeObserver(() => {
        currentPopover.update()
      })

      if (isInverseYPlacement) {
        currentObserver.observe(elem)
      }
    })

    if (binding.value.trigger === 'mouseenter') {
      el.addEventListener('mouseleave', (event) => {
        if (!currentPopover.popper.contains(event.toElement)) {
          removeCurrentPopover()
        }
      })
    }
  }
}
