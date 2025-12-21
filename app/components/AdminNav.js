import React from 'react'
import Link from 'next/link';

export const AdminNav = ({id}) => {
  return (
     <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-white text-xl font-bold">🚛 Aniket Logistic</div>
              <Link href="/" className="text-white hover:text-orange-400 transition-colors flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
            </div>
            <div className="text-white">
              <h2 className="text-md m-3 font-semibold"> {id}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <div>Status: Active</div>
                <div>Last Updated: Today</div>
              </div>
            </div>
          </div>
        </div>
      </nav>
  )
}
