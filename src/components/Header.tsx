import React from 'react'

interface HeaderProps {
  title?: string
  description?: string
}

export const Header: React.FC<HeaderProps> = ({
  title = "sendlogs",
  description = "a spice2x log analysis tool"
}) => {
  return (
    <div className="text-center mb-12">
      <div className="mb-4">
        <span className="text-4xl mr-3">📋</span>
        <h1 className="inline text-4xl font-bold text-white">
          <span className="bg-linear-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-bold">
            {title}
          </span>
        </h1>
      </div>
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  )
}

export default Header
