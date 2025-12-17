import React from 'react'

export const Navbar = () => {
  return (
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white text-2xl font-bold">🚛 Aniket Logistic</div>
            </div>
            <div className="text-white">
              <div className="text-sm">Fleet Management System</div>
              <div className="text-xs opacity-75">Real-time monitoring</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 px-3 py-1 text-center rounded-full text-sm text-green-400 font-bold">
                6 Vehicles Active
              </div>
            </div>
          </div>
        </div>
      </nav>
  )
}
