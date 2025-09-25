import React from 'react'

export default function Input({ className='', ...props }) {
  return (
    <input
      className={
        'w-full rounded-lg bg-card/80 focus:bg-card outline-none px-4 py-3 ' +
        'placeholder-gray-400 border border-gray-700 focus:border-accent transition ' +
        className
      }
      {...props}
    />
  )
}
