import React from 'react'

export default function Button({ as: As='button', className='', ...props }) {
  return (
    <As
      className={
        'inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium ' +
        'bg-gradient-to-r from-accent to-accent2 hover:opacity-90 transition shadow-soft ' +
        className
      }
      {...props}
    />
  )
}