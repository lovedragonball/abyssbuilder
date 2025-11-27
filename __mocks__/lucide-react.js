const React = require('react')

const createIcon = (name) =>
  React.forwardRef((props, ref) =>
    React.createElement('svg', {
      ...props,
      ref,
      'data-icon': name,
    })
  )

module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === '__esModule') return true
      return createIcon(String(prop))
    },
  }
)
