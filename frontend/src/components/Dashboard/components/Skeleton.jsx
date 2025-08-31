import React from 'react';

// Basic skeleton component
export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

// Card skeleton for general use
export const CardSkeleton = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
};

// Table skeleton for lists
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <CardSkeleton>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Search and filters */}
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Table header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 py-3 border-t border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex items-center">
                {colIndex === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ) : colIndex === columns - 1 ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </CardSkeleton>
  );
};

// Stats skeleton for analytics
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded" />
          </div>
        </CardSkeleton>
      ))}
    </div>
  );
};

// Dashboard page skeleton
export const DashboardPageSkeleton = ({ title, hasStats = false, hasTable = true, tableRows = 5 }) => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats if needed */}
      {hasStats && <StatsSkeleton />}
      
      {/* Main content */}
      {hasTable && <TableSkeleton rows={tableRows} />}
    </div>
  );
};

export default Skeleton; 